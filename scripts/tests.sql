\c snmp_collector;

-- Add 100 devices

DO $$
DECLARE
    i INT;
    new_id INT;
BEGIN
    FOR i IN 1..1 LOOP

        INSERT INTO devices (name)
        VALUES ('Device ' || i)
        RETURNING id INTO new_id;

        INSERT INTO devicesconfig (device_id, ip, port, version, community)
        VALUES (new_id, '127.0.0.1', 16101, 2, 'public');

        INSERT INTO oids (device_id, oid, name, frequency)
        VALUES
            (new_id, '1.3.6.1.2.1.1.1.0', 'sysDescr', 10),
            (new_id, '1.3.6.1.2.1.1.2.0', 'sysObjectID', 10),
            (new_id, '1.3.6.1.2.1.1.3.0', 'sysUpTime', 10),
            (new_id, '1.3.6.1.2.1.2.2.1.6.2', 'ifPhysAddress_2', 10),
            (new_id, '1.3.6.1.2.1.4.22.1.3.2.192.21.54.7', 'ipNetToMediaPhysAddress', 10);

    END LOOP;
END $$;