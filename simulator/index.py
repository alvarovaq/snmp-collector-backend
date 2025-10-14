import subprocess
import time
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RES_DIR = os.path.join(BASE_DIR, "res")
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")

SNMPSIM_CMD = os.path.join(SCRIPTS_DIR, "snmpsim-command-responder.exe")

LOG_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

simulators = [
    {
        "name": "device01",
        "port": 16101,
        "version": "2c",
        "community": "public",
        "snmprec": os.path.join(RES_DIR, "device01")
    },
    {
        "name": "device02",
        "port": 16102,
        "version": "3",
        "user": "userSHA",
        "auth_protocol": "SHA",
        "auth_password": "authpass",
        "priv_protocol": "AES",
        "priv_password": "privpass",
        "snmprec": os.path.join(RES_DIR, "device02")
    },
    {
        "name": "device03",
        "port": 16103,
        "version": "3",
        "user": "userMD5",
        "auth_protocol": "MD5",
        "auth_password": "authpass",
        "snmprec": os.path.join(RES_DIR, "device03")
    }
]

processes = []

for sim in simulators:
    cmd = [SNMPSIM_CMD]
    
    cmd += ["--agent-udpv4-endpoint", f"127.0.0.1:{sim['port']}"]
    
    cmd += ["--data-dir", sim["snmprec"]]
    
    if sim["version"] == "3":
        cmd += [
            "--v3-only",
            "--v3-user", sim["user"],
            "--v3-auth-proto", sim["auth_protocol"],
            "--v3-auth-key", sim["auth_password"],
        ]
        if "priv_protocol" in sim and "priv_password" in sim:
            cmd += [
                "--v3-priv-proto", sim["priv_protocol"],
                "--v3-priv-key", sim["priv_password"]
            ]
        
    log_file_path = os.path.join(LOG_DIR, f"{sim['name']}_{sim['port']}.log")
    log_file = open(log_file_path, "w")

    print(f"Iniciando simulador {sim['name']} en puerto {sim['port']}, log: {log_file_path}")
    p = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT)
    processes.append((p, log_file))
    time.sleep(1)

print("Todos los simuladores iniciados. Presiona Ctrl+C para detenerlos.")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Deteniendo simuladores...")
    for p, log_file in processes:
        p.terminate()
        log_file.close()
