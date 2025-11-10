import * as snmp from "net-snmp";
import { logger } from "./logger.service";

export class SnmpTrapListenerService {
    private receiver: snmp.Receiver;

    constructor(private port: number) {
        const options: snmp.ReceiverOptions = {
            port: this.port,
            disableAuthorization: true,
            transport: "udp4"
        };
        this.receiver = snmp.createReceiver(options, this.handleNotification.bind(this));
    };

    private handleNotification(err: Error | null, notification: snmp.Notification): void {
        console.log("hola");
        if (err) {
            logger.error("Error al recibir notificación SNMP:", "SnmpTrapListenerService", err);
            return;
        }

        logger.info(`Trap recibido de ${notification.rinfo.address}:${notification.rinfo.port}`, "SnmpTrapListenerService");
        logger.info(`Versión SNMP: ${notification.version}`, "SnmpTrapListenerService");
        if (notification.community) {
            logger.info(`Comunidad: ${notification.community}`, "SnmpTrapListenerService");
        }
        
        notification.pdu.varbinds.forEach((vb: snmp.Varbind) => {
            logger.info(`OID: ${vb.oid}, Valor: ${vb.value}`, "SnmpTrapListenerService");
        });
    };

    public stop(): void {
        this.receiver.close(() => {
        console.log("Receptor SNMP cerrado");
        });
    }
};