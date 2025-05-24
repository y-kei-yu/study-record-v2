import App from "../App";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Record } from "../domain/record";


const mockData = [
    new Record(1, "test1", 1, "2023-10-01T00:00:00Z"),
    new Record(2, "test2", 2, "2023-10-01T00:00:00Z"),
    new Record(3, "test3", 3, "2023-10-01T00:00:00Z"),
    new Record(4, "test4", 4, "2023-10-01T00:00:00Z"),
];


const mockGetAllRecords = jest.fn().mockResolvedValue(mockData);
const mockInsertRecord = jest.fn().mockResolvedValue(undefined);
const mockDeleteRecord = jest.fn().mockResolvedValue(undefined);
const mockUpdateRecord = jest.fn().mockResolvedValue(undefined);


//モックの実装
jest.mock("../lib/studyRecord.ts", () => {
    return {
        GetAllRecords: () => mockGetAllRecords(),
        InsertRecord: (title: string, time: number) => mockInsertRecord(title, time),
        DeleteRecord: (id: number) => mockDeleteRecord(id),
        UpdateRecord: (id: number, title: string, time: number) => mockUpdateRecord(id, title, time)
    }
})

describe("totalTimeTest", () => {
    beforeEach(() => {
        // 各テスト前にモックをリセット
        jest.clearAllMocks();
        // モックデータを初期状態に戻す
        mockGetAllRecords.mockResolvedValue([...mockData]);
    });

    it("データ追加時に合計時間が変わること", async () => {
        // データコピー
        const currentData = [...mockData];

        mockInsertRecord.mockImplementation((title: string, time: number) => {
            // 新しいデータを追加
            currentData.push(new Record(currentData.length + 1, title, time, new Date().toISOString()));
            // 次に GetAllRecords を呼んだときは新しいデータを返すように
            mockGetAllRecords.mockResolvedValue([...currentData]);
            return Promise.resolve();
        });

        render(<App />)

        // 合計時間の初期値を確認
        const totalTimeTextBefore = await screen.findByText(/合計時間：\d+\/1000\(h\)/);

        // mockData = 1+2+3+4 = 10
        expect(totalTimeTextBefore).toHaveTextContent("合計時間：10/1000(h)");

        // 新規登録ボタンをクリック
        fireEvent.click(await screen.findByRole("button", { name: "新規登録" }));

        // モーダルに入力をする
        fireEvent.change(await screen.findByPlaceholderText("学習内容を記入してください"), {
            target: { value: "React" },
        });
        fireEvent.change(await screen.findByPlaceholderText("学習時間を記入してください"), {
            target: { value: "3" },
        });

        // 登録ボタンをクリック
        fireEvent.click(await screen.findByRole("button", { name: "登録" }));

        // 検証：mockInsertRecordが呼ばれたこと & 合計時間の更新を確認
        await waitFor(async () => {
            expect(mockInsertRecord).toHaveBeenCalledWith("React", 3);

            // 合計時間が 10 + 3 = 13 になっているか確認
            const totalTimeTextAfter = await screen.findByText("合計時間：13/1000(h)");
            expect(totalTimeTextAfter).toBeInTheDocument();
        });
    });

    it("データ削除時に合計時間が減ること", async () => {

        // モックデータコピー
        const currentData = [...mockData];

        //指定されたIDの学習記録を、配列から削除する
        mockDeleteRecord.mockImplementation((id: number) => {
            const index = currentData.findIndex((record => record.id === id))
            if (index !== -1) {
                currentData.splice(index, 1);
            }
            // 次に GetAllRecords を呼んだときは新しいデータを返すように
            mockGetAllRecords.mockResolvedValue([...currentData]);
            return Promise.resolve();
        });

        render(<App />)
        // 合計時間 初期 10
        const totalTimeTextBefore = await screen.findByText("合計時間：10/1000(h)");
        expect(totalTimeTextBefore).toBeInTheDocument();


        // 削除ボタンをクリック（test1の削除）
        const deleteButtons = await screen.findAllByLabelText("削除");
        fireEvent.click(deleteButtons[0]);

        await waitFor(async () => {
            expect(mockDeleteRecord).toHaveBeenCalledWith(1);

            // 合計時間が 9 になる
            const totalTimeTextAfter = await screen.findByText("合計時間：9/1000(h)");
            expect(totalTimeTextAfter).toBeInTheDocument();
        });
    });


    it("データ編集時に合計時間が正しく更新されること", async () => {
        // test1 の学習時間を 1 → 5 に変更（差分+4）
        // データコピー
        const currentData = [...mockData];

        //学習記録を編集する
        mockUpdateRecord.mockImplementation((id: number) => {
            const index = currentData.findIndex((record => record.id === id))
            if (index !== -1) {
                currentData[index] = {
                    ...currentData[index],
                    title: "test11",
                    time: 5
                }
            }
            // 次に GetAllRecords を呼んだときは新しいデータを返すように
            mockGetAllRecords.mockResolvedValue([...currentData]);
            return Promise.resolve();
        })
        render(<App />);

        // 初期：合計時間10
        const totalTimeTextBefore = await screen.findByText("合計時間：10/1000(h)");
        expect(totalTimeTextBefore).toBeInTheDocument();

        // 編集ボタンをクリック（test1）
        const editButtons = await screen.findAllByLabelText("編集");
        fireEvent.click(editButtons[0]);

        // モーダル内のタイトルと時間を変更
        const titleInput = await screen.findByPlaceholderText("学習内容を記入してください");
        fireEvent.change(titleInput, { target: { value: "React(編集)" } });

        const timeInput = await screen.findByPlaceholderText("学習時間を記入してください");
        // 1 → 5に変更
        fireEvent.change(timeInput, { target: { value: "5" } });

        // 更新ボタンをクリック
        const updateButton = await screen.findByRole("button", { name: "更新" });
        fireEvent.click(updateButton);

        await waitFor(async () => {
            expect(mockUpdateRecord).toHaveBeenCalledWith(1, "React(編集)", 5);

            // 合計時間が 10 → 14 に
            const totalTimeTextAfter = await screen.findByText("合計時間：14/1000(h)");
            expect(totalTimeTextAfter).toBeInTheDocument();
        });
    })
})