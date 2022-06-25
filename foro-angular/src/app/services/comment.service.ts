import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { global } from "./global";

@Injectable()
export class CommentService{
    public url: string;

    constructor(
        private _http: HttpClient
    ){
        this.url = global.url;
    }

    prueba(){
        return "Test de commentService";
    }

    add(token, comment, topicID):Observable<any>{
        let params = JSON.stringify(comment);
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                        .set('Authorization', token);

        return this._http.post(this.url+'comment/topic/'+topicID, params, {headers:headers});
    }

    
    delete(token, topicID, commentID):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                        .set('Authorization', token);

        return this._http.delete(this.url + '/comment/'+topicID+'/'+commentID, {headers:headers});
    }

    

   
}