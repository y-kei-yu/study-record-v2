import App from "../App";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Record } from "../domain/record";


const mockData = [
  new Record(1, "test1", 1, "2023-10-01T00:00:00Z"),
  new Record(2, "test2", 2, "2023-10-01T00:00:00Z"),
  new Record(3, "test3", 3, "2023-10-01T00:00:00Z"),
  new Record(4, "test4", 4, "2023-10-01T00:00:00Z"),
];

const mockGetAllRecords = jest.fn()
  .mockResolvedValue(mockData);

const mockInsertRecord = jest.fn().mockResolvedValue(undefined);


//モックの実装
jest.mock("../lib/studyRecord.ts", () => {
  return {
    GetAllRecords: () => mockGetAllRecords(),
    InsertRecord: (title: string, time: number) => mockInsertRecord(title, time),
  }
})


describe("AppTest", () => {
  it("タイトルがあること", async () => {
    render(<App />);
    const title = await screen.findByTestId("testTitle")
    expect(title).toBeInTheDocument();
  });

  it("新規登録ボタンがあること", async () => {
    render(<App />);
    const newButton = await screen.findByRole("button", { name: "新規登録" })
    expect(newButton).toBeInTheDocument();
  })
});

describe("mockAppTest", () => {
  it("テーブルをみることができる(リスト)", async () => {
    render(<App />);
    const table = await screen.findByRole("table")
    expect(table).toBeInTheDocument();
  })


  it("ローディング画面を見ることができること", () => {
    mockGetAllRecords.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockData);
        }, 1000);
      });
    });
    render(<App />)
    const loading = screen.getByText("Loading...")
    expect(loading).toBeInTheDocument();
  })

  it("登録できること", async () => {
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

    //初期のデータ数を取得
    const initialRows = await screen.findAllByRole("row");
    //新規登録ボタンをクリック
    fireEvent.click(await (screen.findByRole("button", { name: "新規登録" })))

    //モーダルに入力をする
    const titleInput = await screen.findByPlaceholderText("学習内容を記入してください")
    fireEvent.change(titleInput, { target: { value: "React" } })
    const timeInput = await screen.findByPlaceholderText("学習時間を記入してください")
    fireEvent.change(timeInput, { target: { value: 3 } })

    //登録ボタンをクリック
    const registerButton = await screen.findByRole("button", { name: "登録" })
    fireEvent.click(registerButton)


    await waitFor(async () => {
      expect(mockInsertRecord).toHaveBeenCalledWith("React", 3);

      const updatedRows = await screen.findAllByRole("row");
      expect(updatedRows.length).toBe(initialRows.length + 1);
    })
  })


  it("モーダルが新規登録というタイトルになっていること", async () => {
    render(<App />);
    //新規登録ボタンをクリック
    fireEvent.click(await (screen.findByRole("button", { name: "新規登録" })))
    const modalTitle = await screen.findByTestId("modalTitle")
    expect(modalTitle).toHaveTextContent("新規登録")
  })

})
