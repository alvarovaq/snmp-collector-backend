CREATE DATABASE snmp_collector
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = false;

\c snmp_collector;

CREATE TABLE IF NOT EXISTS public.devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.devicesconfig (
    device_id INT PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
    ip VARCHAR(45) NOT NULL,
    port INT NOT NULL,
    version INT NOT NULL,
    community VARCHAR(50),
    context VARCHAR(50),
    user_name VARCHAR(50),
    auth_protocol VARCHAR(10),
    auth_key VARCHAR(255),
    priv_protocol VARCHAR(10),
    priv_key VARCHAR(255),
    security_level VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS public.oids (
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    oid VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    frequency INT NOT NULL,
    PRIMARY KEY (device_id, oid)
);

CREATE TABLE IF NOT EXISTS public.records (
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    oid VARCHAR(255) NOT NULL,
    value TEXT,
    error TEXT,
    type VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    PRIMARY KEY (device_id, oid, date)
);
