import EventHandlerInterface from "../../@shared/event/event-handler.interface";
import CustomerCreatedEvent from "./customer-cratead.event";

export default class SendConsoleLog1Handler implements EventHandlerInterface<CustomerCreatedEvent> {
    handle(event: CustomerCreatedEvent): void {
        console.log("Esse é o primeiro console.log do evento: CustomerCreated")
    }
}