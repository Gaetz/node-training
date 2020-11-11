export abstract class CustomError extends Error {
    abstract statusCode: number     // number member variable

    constructor(message:string) {
        super(message)
        Object.setPrototypeOf(this, CustomError.prototype)
    }

    abstract serializeErrors(): {   // method that returns an array of objects
        message: string;            // ...composed by a message string
        field?: string              // ...and an optional string field
    }[]
}