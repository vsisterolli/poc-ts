import connection from "../db/database.js";
import { Request, Response } from "express";
import {User, UserInstance} from "../protocols/user.protocols.js";
import bcrypt from "bcrypt";
import { QueryResult } from "pg";
import jwt from "jsonwebtoken";

export async function signUp(req: Request, res: Response): Promise<void> {
    const user: UserInstance = req.body;
    user.password = bcrypt.hashSync(user.password, 8);
    await connection.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
          [user.username, user.email, user.password]);
    res.sendStatus(201);
}

export async function signIn(req: Request, res: Response): Promise<void> {
    
    const user: UserInstance = req.body;
    
    const query: QueryResult<User> = 
    await connection.query("SELECT * FROM users WHERE email=$1", [user.email]);
    
    const requiredUser: User = query.rows[0];
    if(!requiredUser)
        res.sendStatus(404);
    else if(bcrypt.compareSync(user.password, requiredUser.password))
        res.send(jwt.sign({id: requiredUser.id}, "pocahontas"));
    else
        res.sendStatus(401);
        
}