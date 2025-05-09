import { Box, Button, Center, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GetAllRecords } from "./lib/studyRecord";
import { Record } from "./domain/record";
import React from "react";








function App() {
  const [records, setRecords] = useState<Record[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getAllRecords = async () => {
      const allRecords = await GetAllRecords()
      setRecords(allRecords)
      setIsLoading(false)
    }

    getAllRecords()
  }, [])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = React.useRef(null)
  const finalRef = React.useRef(null)

  if (isLoading) {
    return <p>Loading...</p>
  }
  return (
    <>
      <Box w='30%' p={4} bg="teal.200" color={'white'} justifyContent={'center'} margin='auto' mt={4} borderRadius='md'>
        <Center bg='white' h='100px' color='black' fontSize={'30px'} borderRadius='lg'>
          <h1>新・学習記録アプリ</h1>
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
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Button onClick={onOpen}>Open Modal</Button>
      <Button ml={4} ref={finalRef}>
        Ill receive focus on close
      </Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create your account</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>First name</FormLabel>
              <Input ref={initialRef} placeholder='First name' />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Last name</FormLabel>
              <Input placeholder='Last name' />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default App;
