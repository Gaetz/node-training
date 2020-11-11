import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors/custom-error'

export const errorHandler = (err: Error, req: Request, res: Response, next:NextFunction) => {
    
    if(err instanceof CustomError) {
        const tsErr = err as CustomError
        return res.status(tsErr.statusCode).send({ errors: tsErr.serializeErrors() })
    }

    res.status(400).send({ errors: [{ message: 'Unidentified error' }] })
}