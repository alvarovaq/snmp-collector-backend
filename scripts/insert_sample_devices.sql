\c snmp_collector;

DO $$
DECLARE
    new_id INT;
BEGIN
    -- Device 1
    INSERT INTO devices (name) VALUES ('Device 1') RETURNING id INTO new_id;

    INSERT INTO devicesconfig (device_id, ip, port, version, community)
    VALUES (new_id, '127.0.0.1', 16101, 2, 'public');

    INSERT INTO oids (device_id, oid, name, frequency)
    VALUES
        (new_id, '1.3.6.1.2.1.1.1.0', 'sysDescr', 30),
        (new_id, '1.3.6.1.2.1.1.2.0', 'sysObjectID', 30),
        (new_id, '1.3.6.1.2.1.1.3.0', 'sysUpTime', 20),
        (new_id, '1.3.6.1.2.1.2.2.1.6.2', 'ifPhysAddress_2', 30),
        (new_id, '1.3.6.1.2.1.4.22.1.3.2.192.21.54.7', 'ipNetToMediaPhysAddress', 30);

    -- Device 2
    INSERT INTO devices (name) VALUES ('Device 2') RETURNING id INTO new_id;

    INSERT INTO devicesconfig (device_id, ip, port, version, context, user_name, security_level)
    VALUES (new_id, '127.0.0.1', 16102, 3, 'public', 'user2', 'noAuthNoPriv');

    INSERT INTO oids (device_id, oid, name, frequency)
    VALUES
        (new_id, '1.3.6.1.2.1.1.1.0', 'sysDescr', 30),
        (new_id, '1.3.6.1.2.1.1.2.0', 'sysObjectID', 30),
        (new_id, '1.3.6.1.2.1.1.3.0', 'sysUpTime', 20),
        (new_id, '1.3.6.1.2.1.2.2.1.6.2', 'ifPhysAddress_2', 30),
        (new_id, '1.3.6.1.2.1.4.22.1.3.2.192.21.54.7', 'ipNetToMediaPhysAddress', 30);

    -- Device 3
    INSERT INTO devices (name) VALUES ('Device 3') RETURNING id INTO new_id;

    INSERT INTO devicesconfig (device_id, ip, port, version, context, user_name, security_level, auth_protocol, auth_key)
    VALUES (new_id, '127.0.0.1', 16103, 3, 'public', 'user3', 'authNoPriv', 'md5', 'authpass');

    INSERT INTO oids (device_id, oid, name, frequency)
    VALUES
        (new_id, '1.3.6.1.2.1.1.1.0', 'sysDescr', 30),
        (new_id, '1.3.6.1.2.1.1.2.0', 'sysObjectID', 30),
        (new_id, '1.3.6.1.2.1.1.3.0', 'sysUpTime', 20),
        (new_id, '1.3.6.1.2.1.2.2.1.6.2', 'ifPhysAddress_2', 30),
        (new_id, '1.3.6.1.2.1.4.22.1.3.2.192.21.54.7', 'ipNetToMediaPhysAddress', 30);

    -- Device 4
    INSERT INTO devices (name) VALUES ('Device 4') RETURNING id INTO new_id;

    INSERT INTO devicesconfig (device_id, ip, port, version, context, user_name, security_level, auth_protocol, auth_key, priv_protocol, priv_key)
    VALUES (new_id, '127.0.0.1', 16104, 3, 'public', 'user4', 'authPriv', 'sha', 'authpass', 'aes', 'privpass');

    INSERT INTO oids (device_id, oid, name, frequency)
    VALUES
        (new_id, '1.3.6.1.2.1.1.1.0', 'sysDescr', 30),
        (new_id, '1.3.6.1.2.1.1.2.0', 'sysObjectID', 30),
        (new_id, '1.3.6.1.2.1.1.3.0', 'sysUpTime', 20),
        (new_id, '1.3.6.1.2.1.2.2.1.6.2', 'ifPhysAddress_2', 30),
        (new_id, '1.3.6.1.2.1.4.22.1.3.2.192.21.54.7', 'ipNetToMediaPhysAddress', 30);
END $$;
