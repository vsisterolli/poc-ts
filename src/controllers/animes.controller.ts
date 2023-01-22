import { Request, Response } from "express";
import { QueryResult } from "pg";
import connection from "../db/database.js";
import { AnimeInstance } from "../protocols/anime.protocols.js";

export async function insertAnime(req: Request, res: Response): Promise<void> {
    const {name, image}: {name: string, image: string} = req.body;
    await connection.query("INSERT INTO animes (name, image, user_id) VALUES ($1, $2, $3)", 
    [name, image, res.locals.user]);
    res.sendStatus(201);
}

export async function getUsersAnime(req: Request, res: Response): Promise<void> {
    const animes: QueryResult<AnimeInstance> = 
    await connection.query("SELECT * FROM animes WHERE user_id=$1", [res.locals.user]);
    res.send(animes.rows);
}

export async function deleteAnime(req: Request, res: Response) {
    
    const animeId: string = req.params.id;
    
    const user_id: QueryResult<AnimeInstance> = 
    await connection.query("SELECT user_id FROM animes WHERE id=$1", [animeId]);
    
    if(!user_id.rows.length)
        return res.sendStatus(404);
    else if(user_id.rows[0].user_id !== res.locals.user)
        return res.sendStatus(401);
    else await connection.query("DELETE FROM animes WHERE id=$1", [animeId]);

    return res.sendStatus(200)
}

export async function updateAnimeStatus(req: Request, res: Response): Promise<void> {
    
    const animeId: string = req.params.id;
    const newStatus: string = req.body.status;

    const user_id: QueryResult<AnimeInstance> = 
    await connection.query("SELECT user_id FROM animes WHERE id=$1", [animeId]);
    
    if(!user_id.rows.length) {
        res.sendStatus(404);
        return;
    }
    else if(user_id.rows[0].user_id !== res.locals.user) {
        res.sendStatus(401);
        return;
    }
    else await connection.query("UPDATE animes SET status=$1 WHERE id=$2", [newStatus, animeId]);

    res.sendStatus(200)
    return;
}