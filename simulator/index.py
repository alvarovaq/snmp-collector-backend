import subprocess
import time
import os
import json
import sys
import shutil
import random
import threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = os.path.join(BASE_DIR, "logs")
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
SNMPSIM_CMD = os.path.join(BASE_DIR, "scripts", "snmpsim-command-responder.exe")

os.makedirs(LOG_DIR, exist_ok=True)


# ------------------------------------------------------------
# UTILIDADES SNMPREC (leer / escribir / actualizar)
# ------------------------------------------------------------

def read_snmprec(path):
    """Lee un archivo snmprec y devuelve una lista de diccionarios."""
    entries = []
    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("|")
            if len(parts) == 4:
                oid, t, value, community = parts
                entries.append({"oid": oid, "type": t, "value": value, "community": community})
            elif len(parts) == 3:
                oid, t, value = parts
                entries.append({"oid": oid, "type": t, "value": value, "community": None})
            else:
                print(f"WARNING: línea inválida en {path}: {line}")
    return entries


def write_snmprec(path, entries):
    """Escribe una lista de entradas snmprec en archivo."""
    lines = []
    for e in entries:
        if e["community"]:
            lines.append(f"{e['oid']}|{e['type']}|{e['value']}|{e['community']}")
        else:
            lines.append(f"{e['oid']}|{e['type']}|{e['value']}")
    with open(path, "w") as f:
        f.write("\n".join(lines))


def apply_oid_changes(entries, oid_configs):
    """Actualiza valores en entries según configuración OID."""
    for e in entries:
        for conf in oid_configs:
            if e["oid"] == conf["oid"]:
                min_val = conf["min"]
                max_val = conf["max"]

                if isinstance(min_val, int) and isinstance(max_val, int):
                    e["value"] = str(random.randint(min_val, max_val))
                else:
                    e["value"] = str(round(random.uniform(min_val, max_val), 1))
    return entries


# ------------------------------------------------------------
# FUNCIONES GENERALES
# ------------------------------------------------------------

def clean_folders():
    folders = [LOG_DIR, os.path.join(BASE_DIR, "snmprec")]

    for folder in folders:
        if os.path.exists(folder):
            try:
                shutil.rmtree(folder)
                print(f"[OK] Carpeta eliminada: {folder}")
            except Exception as e:
                print(f"ERROR al eliminar {folder}: {e}")
        os.makedirs(folder, exist_ok=True)


def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"ERROR: No se encontró el archivo de configuración: {CONFIG_FILE}")
        sys.exit(1)

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        try:
            config = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERROR: JSON inválido: {e}")
            sys.exit(1)

    if "devices" not in config:
        print("ERROR: Falta sección 'devices'")
        sys.exit(1)

    return config["devices"]


def copy_snmprec(device):
    src = os.path.join(BASE_DIR, device["base_snmprec"])
    if not os.path.exists(src):
        print(f"ERROR: No existe archivo base snmprec: {src}")
        sys.exit(1)

    dst_dir = os.path.join(BASE_DIR, "snmprec", device["name"])
    os.makedirs(dst_dir, exist_ok=True)

    if str(device["version"]) == "3":
        snmprec_name = device.get("context", "public") + ".snmprec"
    else:
        snmprec_name = "public.snmprec"

    dst = os.path.join(dst_dir, snmprec_name)

    try:
        shutil.copyfile(src, dst)
        print(f"[OK] SNMPREC copiado: {src} -> {dst}")
    except Exception as e:
        print(f"ERROR copiando snmprec: {e}")
        sys.exit(1)

    return dst_dir, snmprec_name


def build_command(device):
    cmd = [SNMPSIM_CMD, "--agent-udpv4-endpoint", f"127.0.0.1:{device['port']}"]

    if "data_dir" not in device:
        print(f"ERROR: data_dir no definido en {device['name']}")
        sys.exit(1)

    cmd += ["--data-dir", device["data_dir"]]

    if str(device["version"]) == "3":
        if "user" not in device:
            print(f"ERROR: Dispositivo {device['name']} v3 requiere 'user'")
            sys.exit(1)

        cmd += ["--v3-only", "--v3-user", device["user"]]

        if "auth_protocol" in device and "auth_password" in device:
            cmd += ["--v3-auth-proto", device["auth_protocol"],
                    "--v3-auth-key", device["auth_password"]]

            if "priv_protocol" in device and "priv_password" in device:
                cmd += ["--v3-priv-proto", device["priv_protocol"],
                        "--v3-priv-key", device["priv_password"]]

        if device.get("v3_context"):
            cmd += ["--v3-context-name", device["v3_context"]]

    return cmd


# ------------------------------------------------------------
# ACTUALIZACIÓN PERIÓDICA DE OIDs
# ------------------------------------------------------------

def update_snmprec_values_periodically(device):
    if "oids" not in device:
        return

    snmprec_file = os.path.join(
        BASE_DIR, "snmprec", device["name"],
        device.get("context", "public") + ".snmprec"
    )

    def updater():
        while True:
            try:
                entries = read_snmprec(snmprec_file)
                entries = apply_oid_changes(entries, device["oids"])
                write_snmprec(snmprec_file, entries)
            except Exception as e:
                print(f"ERROR actualizando {device['name']}: {e}")

            time.sleep(min(oid.get("interval", 60) for oid in device["oids"]))

    thread = threading.Thread(target=updater, daemon=True)
    thread.start()


# ------------------------------------------------------------
# INICIO DEL PROGRAMA
# ------------------------------------------------------------

def start_simulators(devices):
    processes = []

    for dev in devices:
        if "base_snmprec" in dev:
            generated_dir, snmprec_name = copy_snmprec(dev)
            dev["data_dir"] = generated_dir
            if str(dev["version"]) == "3":
                dev["v3_context"] = dev.get("context", "")

        # Procesar OIDs iniciales
        if "oids" in dev:
            snmprec_file = os.path.join(dev["data_dir"],
                                        dev.get("context", "public") + ".snmprec")
            entries = read_snmprec(snmprec_file)
            entries = apply_oid_changes(entries, dev["oids"])
            write_snmprec(snmprec_file, entries)

        update_snmprec_values_periodically(dev)

        cmd = build_command(dev)
        log_file_path = os.path.join(LOG_DIR, f"{dev['name']}_{dev['port']}.log")
        log_file = open(log_file_path, "w")

        print(f"Iniciando {dev['name']} en puerto {dev['port']} -> log: {log_file_path}")

        p = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT)
        processes.append((p, log_file))

        time.sleep(1)

    print("\nTodos los simuladores iniciados.\n")
    return processes


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
