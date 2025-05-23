import { Box, Button, Center, FormControl, FormLabel, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DeleteRecord, GetAllRecords, InsertRecord, UpdateRecord } from "./lib/studyRecord";
import { Record } from "./domain/record";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";


function App() {
  const [records, setRecords] = useState<Record[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [currentRecord, setCurrentRecord] = useState<Record | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Record>();

  //新規登録ボタンをクリック処理
  const handleRegisterClick = () => {
    reset({
      title: "",
      time: undefined
    })
    setCurrentRecord(null)
    setModalMode("create")
    onOpen()
  }
  //編集ボタンをクリック処理
  const handleEditClick = (record: Record) => {
    setModalMode("edit")
    setCurrentRecord(record)
    reset({
      title: record.title,
      time: record.time
    })
    onOpen()
  }

  //削除ボタンをクリック処理
  const handleDeleteClick = async (id: number) => {
    await DeleteRecord(id)
    //削除後にデータを取得
    getAllRecords()
  }

  //キャンセルボタンをクリック処理
  const handleCancelClick = () => {
    reset({
      title: "",
      time: undefined
    })
    setCurrentRecord(null)
    onClose()
  }



  //全データ取得
  const getAllRecords = async () => {
    const allRecords = await GetAllRecords()
    console.log(allRecords)
    setRecords(allRecords)
    setIsLoading(false)
  }

  //データ登録、更新処理
  const onSubmit: SubmitHandler<Record> = async (data) => {
    if (modalMode === "create") {
      await InsertRecord(data.title, data.time)
    } else if (modalMode === "edit") {
      if (currentRecord) {
        await UpdateRecord(currentRecord.id, data.title, data.time)
      }
    }
    //登録後にデータを取得
    getAllRecords();


    //モーダルを初期化し閉じる
    reset({
      title: "",
      time: undefined
    })
    setCurrentRecord(null)
    onClose()
  }



  //一覧画面表示
  useEffect(() => {
    getAllRecords()
  }, [])






  //ローディング
  if (isLoading) {
    return <p>Loading...</p>
  }
  return (
    <>
      <Box w="30%" p={4} bg="teal.200" color={"white"} justifyContent={"center"} margin="auto" mt={4} borderRadius="md">
        <Center bg="white" h="100px" color="black" fontSize={"30px"} borderRadius="lg">
          <h1 data-testid="testTitle">新・学習記録アプリ</h1>
        </Center>
        <Box display="flex" justifyContent="flex-end" my={2}>
          <Button colorScheme="teal" onClick={(handleRegisterClick)}>新規登録</Button>
        </Box>
        <TableContainer overflowX="auto">
          <Table variant="striped" colorScheme="teal" color="black">
            <Thead>
              <Tr>
                <Th>学習内容</Th>
                <Th>学習時間(h)</Th>
                <Th>編集</Th>
                <Th>削除</Th>

              </Tr>
            </Thead>
            <Tbody>
              {records.map((record) => (
                <Tr key={record.id}>
                  <Td>{record.title}</Td>
                  <Td>{record.time}</Td>
                  <Td>
                    <IconButton
                      aria-label="編集"
                      icon={<FaRegEdit />}
                      variant="ghost"
                      color="teal.500"
                      onClick={() => { handleEditClick(record) }}
                    />
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="削除"
                      icon={<MdDelete />}
                      variant="ghost"
                      color="teal.500"
                      onClick={() => { handleDeleteClick(record.id) }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={handleCancelClick}
      >
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader fontSize={"30px"} data-testid="modalTitle">{modalMode === "create" ? "新規登録" : "記録編集"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>学習内容</FormLabel>
                <Input
                  type="text"
                  placeholder="学習内容を記入してください"
                  {...register("title", { required: true })} />
                {errors.title && <span style={{ color: "red" }} data-testid="titleErrorMessage">学習内容の入力は必須です</span>}
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>学習時間</FormLabel>
                <Input
                  type="number"
                  placeholder="学習時間を記入してください"
                  {...register(
                    "time", {
                    required: "学習時間の入力は必須です",
                    valueAsNumber: true,
                    min: {
                      value: 1, message: "学習時間は0以上である必要があります"
                    }
                  })}
                  data-testid="minErrorMessage"
                />
                {errors.time && (
                  <span style={{ color: "red" }} data-testid="timeErrorMessage">{errors.time.message}</span>
                )}
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button type="submit" colorScheme="teal" mr={3}>
                {modalMode === "create" ? "登録" : "更新"}
              </Button>
            </ModalFooter>
          </form >
        </ModalContent>
      </Modal>

    </>
  );
}

export default App;
