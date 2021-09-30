import {ExpirationComleteEvent, Publisher, Subjects} from "@maxytick/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationComleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}