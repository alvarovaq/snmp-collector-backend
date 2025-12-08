import subprocess
import time
import os
import json
import sys
import shutil

# -----------------------------
# Configuración base
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = os.path.join(BASE_DIR, "logs")
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
SNMPSIM_CMD = os.path.join(BASE_DIR, "scripts", "snmpsim-command-responder.exe")

os.makedirs(LOG_DIR, exist_ok=True)

def clean_folders():
    folders = [LOG_DIR, os.path.join(BASE_DIR, "snmprec")]

    for folder in folders:
        if os.path.exists(folder):
            try:
                shutil.rmtree(folder)
                print(f"[OK] Carpeta eliminada: {folder}")
            except Exception as e:
                print(f"ERROR al eliminar {folder}: {e}")
        os.makedirs(folder, exist_ok=True)  # Volver a crear la carpeta vacía

# -----------------------------
# Cargar configuración JSON
# -----------------------------
def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"ERROR: No se encontró el archivo de configuración: {CONFIG_FILE}")
        sys.exit(1)

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        try:
            config = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERROR: El archivo JSON no es válido: {e}")
            sys.exit(1)

    if "devices" not in config:
        print("ERROR: El archivo JSON debe contener una sección 'devices'")
        sys.exit(1)

    return config["devices"]


# -----------------------------
# Copiar .snmprec base → destino generado
# -----------------------------
def copy_snmprec(device):
    src = os.path.join(BASE_DIR, device["base_snmprec"])

    if not os.path.exists(src):
        print(f"ERROR: No se encontró el archivo snmprec base: {src}")
        sys.exit(1)

    dst_dir = os.path.join(BASE_DIR, "snmprec", device["name"])
    os.makedirs(dst_dir, exist_ok=True)

    # Nombre del snmprec
    if str(device["version"]).lower() == "3":
        snmprec_name = device.get("context", "public") + ".snmprec"
    else:
        snmprec_name = "public.snmprec"

    dst = os.path.join(dst_dir, snmprec_name)

    try:
        shutil.copyfile(src, dst)
        print(f"[OK] SNMPREC copiado: {src} -> {dst}")
    except Exception as e:
        print(f"ERROR al copiar snmprec para {device['name']}: {e}")
        sys.exit(1)

    # Retornar carpeta destino y nombre del archivo
    return dst_dir, snmprec_name


# -----------------------------
# Construir comando SNMPSIM
# -----------------------------
def build_command(device):
    cmd = [SNMPSIM_CMD]

    # Endpoint
    cmd += ["--agent-udpv4-endpoint", f"127.0.0.1:{device['port']}"]

    # Data directory
    if "data_dir" not in device:
        print(f"ERROR: No se definió data_dir para {device['name']}")
        sys.exit(1)
    cmd += ["--data-dir", device["data_dir"]]

    version = str(device["version"]).lower()

    # SNMPv3
    if version == "3":
        if "user" not in device:
            print(f"ERROR: El dispositivo {device['name']} es v3 y requiere 'user'")
            sys.exit(1)

        cmd += ["--v3-only", "--v3-user", device["user"]]

        # Auth
        if "auth_protocol" in device and "auth_password" in device:
            cmd += [
                "--v3-auth-proto", device["auth_protocol"],
                "--v3-auth-key", device["auth_password"]
            ]

            # Privacidad opcional
            if "priv_protocol" in device and "priv_password" in device:
                cmd += [
                    "--v3-priv-proto", device["priv_protocol"],
                    "--v3-priv-key", device["priv_password"]
                ]

        # Contexto opcional
        context = device.get("v3_context")
        if context:
            cmd += ["--v3-context-name", context]

    elif version not in ["1", "2c"]:
        print(f"ERROR: Versión SNMP inválida para {device['name']}: {version}")
        sys.exit(1)

    return cmd


# -----------------------------
# Iniciar todos los simuladores
# -----------------------------
def start_simulators(devices):
    processes = []

    for dev in devices:

        # 1️⃣ Copiar .snmprec base → destino generado
        if "base_snmprec" in dev:
            generated_dir, snmprec_name = copy_snmprec(dev)
            dev["data_dir"] = generated_dir
            # Para SNMPv3, indicamos contexto si existe
            if str(dev["version"]).lower() == "3":
                dev["v3_context"] = dev.get("context", "")

        # 2️⃣ Construir comando
        cmd = build_command(dev)

        # 3️⃣ Log del proceso
        log_file_path = os.path.join(LOG_DIR, f"{dev['name']}_{dev['port']}.log")
        log_file = open(log_file_path, "w")

        print(f"Iniciando {dev['name']} en puerto {dev['port']} -> log: {log_file_path}")
        p = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT)
        processes.append((p, log_file))

        time.sleep(1)

    print("\nTodos los simuladores iniciados. Ctrl+C para detener.\n")
    return processes


# -----------------------------
# Programa principal
# -----------------------------
def main():
    clean_folders()
    devices = load_config()
    processes = start_simulators(devices)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nDeteniendo simuladores...")
        for p, log_file in processes:
            p.terminate()
            log_file.close()
        print("Todos detenidos.")


if __name__ == "__main__":
    main()
