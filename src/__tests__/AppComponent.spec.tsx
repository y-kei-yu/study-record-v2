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

//モック不必要
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




//モック必要
describe("mockAppTest", () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
    // モックデータを初期状態に戻す
    mockGetAllRecords.mockResolvedValue([...mockData]);
  });
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
    fireEvent.change(timeInput, { target: { value: "3" } })

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

  it("学習内容が未入力のときに登録するとエラーがでること", async () => {
    render(<App />);
    //新規登録ボタンをクリック
    fireEvent.click(await (screen.findByRole("button", { name: "新規登録" })))
    //学習時間のみ入力
    const timeInput = await screen.findByPlaceholderText("学習時間を記入してください")
    fireEvent.change(timeInput, { target: { value: "3" } })
    //登録ボタンをクリック
    const registerButton = await screen.findByRole("button", { name: "登録" })
    fireEvent.click(registerButton)
    expect(timeInput).toHaveValue(3)
    const errorMessage = await screen.findByTestId("titleErrorMessage");
    expect(errorMessage).toHaveTextContent("学習内容の入力は必須です")

  })

  it("学習時間が未入力のときに登録するとエラーがでること", async () => {
    render(<App />);
    //新規登録ボタンをクリック
    fireEvent.click(await (screen.findByRole("button", { name: "新規登録" })))
    //学習内容のみ入力
    const titleInput = await screen.findByPlaceholderText("学習内容を記入してください")
    fireEvent.change(titleInput, { target: { value: "React2" } })
    //登録ボタンをクリック
    const registerButton = await screen.findByRole("button", { name: "登録" })
    fireEvent.click(registerButton)
    expect(titleInput).toHaveValue("React2")
    const errorMessage = await screen.findByTestId("timeErrorMessage");
    expect(errorMessage).toHaveTextContent("学習時間の入力は必須です")
  })

  it("学習時間が0以上でないときのエラーがでること", async () => {
    render(<App />);
    //新規登録ボタンをクリック
    fireEvent.click(await (screen.findByRole("button", { name: "新規登録" })))
    //学習内容を入力
    const titleInput = await screen.findByPlaceholderText("学習内容を記入してください")
    fireEvent.change(titleInput, { target: { value: "React3" } })
    //学習時間を入力
    const timeInput = await screen.findByPlaceholderText("学習時間を記入してください")
    fireEvent.change(timeInput, { target: { value: "0" } })

    //登録ボタンをクリック
    const registerButton = await screen.findByRole("button", { name: "登録" })
    fireEvent.click(registerButton)

    expect(titleInput).toHaveValue("React3")
    expect(timeInput).toHaveValue(0)
    const errorMessage = await screen.findByTestId("timeErrorMessage");
    expect(errorMessage).toHaveTextContent("学習時間は0以上である必要があります")
  })



  it("ユーザーは学習記録を削除することができること", async () => {
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
    render(<App />);
    const deleteButtons = await screen.findAllByRole("button", { name: "削除" })
    //test2のモックデータを削除
    fireEvent.click(deleteButtons[1])
    await waitFor(() => {
      expect(screen.queryByText("test2")).toBeNull();
    })

    // mockDeleteRecordが正しく呼び出されたことを確認
    expect(mockDeleteRecord).toHaveBeenCalledWith(2);
  })

  it("モーダルのタイトルが記録編集であること", async () => {
    render(<App />);
    //test3の編集ボタンをクリック
    const editButtons = await screen.findAllByRole("button", { name: "編集" })
    fireEvent.click(editButtons[2])
    const modalTitle = await screen.findByTestId("modalTitle")
    expect(modalTitle).toHaveTextContent("記録編集");

  })

  it("編集して登録すると更新されること", async () => {
    // データコピー
    const currentData = [...mockData];

    //指定されたIDの学習記録を、配列に追加する
    mockUpdateRecord.mockImplementation((id: number) => {
      const index = currentData.findIndex((record => record.id === id))
      if (index !== -1) {
        currentData[index] = {
          ...currentData[index],
          title: "Test444",
          time: 10
        }
      }
      // 次に GetAllRecords を呼んだときは新しいデータを返すように
      mockGetAllRecords.mockResolvedValue([...currentData]);
      return Promise.resolve();
    });


    render(<App />)
    //test4の編集ボタンをクリック
    const editButtons = await screen.findAllByRole("button", { name: "編集" })
    console.log("編集ボタンの数：", editButtons.length);
    fireEvent.click(editButtons[3])

    //すでに登録されている学習内容を表示
    const titleInput = await screen.findByDisplayValue("test4")
    expect(titleInput).toHaveValue("test4")
    //すでに登録されている学習時間を表示
    const timeInput = await screen.findByDisplayValue("4")
    expect(timeInput).toHaveValue(4)

    //学習内容、学習時間を編集
    fireEvent.change(titleInput, { target: { value: "Test444" } })
    fireEvent.change(timeInput, { target: { value: "10" } })

    //更新ボタンをクリック
    const updateButton = await screen.findByRole("button", { name: "更新" })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText("Test444")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.queryByText("test4")).toBeNull();
      expect(screen.queryByText("4")).toBeNull();
    })
    // モック関数が正しく呼び出されたか確認
    expect(mockUpdateRecord).toHaveBeenCalledWith(4, "Test444", 10);

  })
})