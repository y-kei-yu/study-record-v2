
import { Record } from "../domain/record";
import { supabase } from "../utils/supabase";

//データ取得
export async function GetAllRecords(): Promise<Record[]> {
    const response = await supabase
                        .from("study-record")
                        .select("*")
                        // 作成日時の新しい順にする
                        .order("created_at", { ascending: true})

    if (response.error) {
        throw new Error(response.error.message)
    }
    const recordsData = response.data.map((record) => {
        return new Record(record.id,record.title,record.time,record.created_at)
        console.log(record) 
    })
    return recordsData
}

//データ登録
export async function InsertRecord(title: string, time: number) {
    const response = await supabase
                        .from("study-record")
                        .insert({title,time})
                        .select()
    
    if (response.error) {
        throw new Error(response.error.message)
    }
}

//データ更新
export async function UpdateRecord(id: number,title:string,time: number) {
    const response = await supabase
                        .from("study-record")
                        .update({title,time})
                        .eq("id", id)
                        .select()
    if (response.error) {
        throw new Error(response.error.message)
    }
}

//データ削除
export async function DeleteRecord(id: number) {
    const response = await supabase
                        .from("study-record")
                        .delete()
                        .eq("id", id)
                        .select()
    if (response.error) {
        throw new Error(response.error.message)
    }
}