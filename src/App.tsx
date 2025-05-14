import { Box, Button, Center, FormControl, FormLabel, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DeleteRecord, GetAllRecords, InsertRecord } from "./lib/studyRecord";
import { Record } from "./domain/record";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";





function App() {
  const [records, setRecords] = useState<Record[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Record>();

  //全データ取得
  const getAllRecords = async () => {
    const allRecords = await GetAllRecords()
    console.log(allRecords)
    setRecords(allRecords)
    setIsLoading(false)
  }

  //データ登録
  const onSubmit: SubmitHandler<Record> = async (data) => {
    //console.log(data)
    await InsertRecord(data.title, data.time)

    //登録後にデータを取得
    getAllRecords();

    //モーダルを初期化し閉じる
    reset()
    onClose()
  }

  //データ削除
  const deleteRecord = async (id: number) => {
    await DeleteRecord(id)
    //削除後にデータを取得
    getAllRecords()
  }


  //一覧画面表示
  useEffect(() => {
    getAllRecords()
  }, [])



  const { isOpen, onOpen, onClose } = useDisclosure()


  //ローディング
  if (isLoading) {
    return <p>Loading...</p>
  }
  return (
    <>
      <Box w='30%' p={4} bg="teal.200" color={'white'} justifyContent={'center'} margin='auto' mt={4} borderRadius='md'>
        <Center bg='white' h='100px' color='black' fontSize={'30px'} borderRadius='lg'>
          <h1 data-testid="testTitle">新・学習記録アプリ</h1>
        </Center>
        <Box display="flex" justifyContent="flex-end" my={2}>
          <Button colorScheme='teal' onClick={onOpen}>新規登録</Button>
        </Box>
        <TableContainer>
          <Table variant='striped' colorScheme='teal' color='black'>
            <Thead>
              <Tr>
                <Th>学習内容</Th>
                <Th>学習時間(h)</Th>
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
                    />
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="削除"
                      icon={<MdDelete />}
                      variant="ghost"
                      color="teal.500"
                      onClick={() => { deleteRecord(record.id) }}
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
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader fontSize={'30px'} data-testid="modalTitle">新規登録</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>学習内容</FormLabel>
                <Input
                  type="text"
                  placeholder="学習内容を記入してください"
                  {...register("title", { required: true })} />
                {errors.title && <span style={{ color: "red" }}>学習内容の入力は必須です</span>}
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>学習時間</FormLabel>
                <Input
                  type="number"
                  placeholder='学習時間を記入してください'
                  {...register(
                    "time", {
                    required: "学習時間の入力は必須です",
                    valueAsNumber: true,
                    min: {
                      value: 1, message: "学習時間は0以上である必要があります"
                    }
                  })}
                />
                {errors.time && (
                  <span style={{ color: "red" }}>{errors.time.message}</span>
                )}
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button type="submit" colorScheme='teal' mr={3}>
                登録
              </Button>
            </ModalFooter>
          </form >
        </ModalContent>
      </Modal>

    </>
  );
}

export default App;
