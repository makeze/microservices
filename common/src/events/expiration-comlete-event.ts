import {Subjects} from "./subjects";

export interface ExpirationComleteEvent {
    subject: Subjects.ExpirationComplete;
    data: {
        orderId: string;
    }
}