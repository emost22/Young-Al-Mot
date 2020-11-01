import React, { useState, useEffect } from "react";
import socketio from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { buttons } from "polished";

import RoomChat from "../components/RoomChat";
import RoomOut from "../components/RoomOut";
import { roomOutRequest } from "../modules/room";

const AllContent = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ChatName = styled.span`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  border-right: solid thin;
`;

const ChatMessage = styled.span`
  flex: 4;
  padding-left: 5px;
`;

const ChatBodyContent = styled.div`
  display: flex;
  border-bottom: solid thin;
`;

const BodyContent = styled.div`
  height: 60%;
`;

const BottomContent = styled.div`
  height: 40%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const BotLeft = styled.div`
  flex: 1;
  margin-bottom: 3vh;
`;

const BotMid = styled.div`
  flex: 3;
  margin-bottom: 3vh;
`;

const BotRight = styled.div`
  flex: 1;
  margin-bottom: 3vh;
`;

//서버 주소
const socket = socketio.connect("http://localhost:5000");

const RoomContainer = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const user = useSelector((state) => state.auth.status);
  const room = useSelector((state) => state.room.room);

  const handleChangeMessage = (e) => {
    setMessage(e.target.value);
  };
  const [allmessage, setAllmessage] = useState("");

  const send = (e) => {
    //백엔드 완성되면 수정해야됨
    socket.emit("msg", {
      //roomno: room.roomid,
      roomno: Number(sessionStorage.setRoomId),
      name: user.currentNickname,
      message: message,
    });
    setMessage("");
  };
  //마운트 되었을때
  useEffect(() => {
    //session에 아무것도 없으면 roomList로 이동
    if (sessionStorage.setRoomId === undefined) {
      history.push("/roomList");
    }
    // 실시간으로 로그를 받게 설정
    //백엔드 완성되면 수정해야됨
    socket.on(Number(sessionStorage.setRoomId) /*room.roomid*/, (obj) => {
      const logs2 = logs;
      obj.key = "key_" + (logs.length + 1);
      logs2.unshift(obj); // 로그에 추가하기
      setLogs(logs2);
      const tmp = logs.map((e) => (
        <ChatBodyContent key={e.key}>
          <ChatName>{e.name}</ChatName>
          <ChatMessage>{e.message}</ChatMessage>
        </ChatBodyContent>
      ));
      setAllmessage(tmp);
      console.log("chat", tmp);
    });
  }, [logs]);

  const roomOut = () => {
    dispatch(roomOutRequest(room.roomid,user.currentUser)).then((res) => {
      history.push("/roomList");
    });
  };

  console.log(sessionStorage.setRoomId);

  return (
    <AllContent>
      <BodyContent>
        {/* 게임화면이나 사용자넣는곳 */}
        게임화면
      </BodyContent>

      <BottomContent>
        {/* 채팅, 나가기 */}
        <BotLeft></BotLeft>
        <BotMid>
        <RoomChat
          user={user}
          message={message}
          roomid={room.roomid}
          handleChangeMessage={handleChangeMessage}
          send={send}
          setLogs={setLogs}
          allmessage={allmessage}
        />
        </BotMid>
        <BotRight>
          <RoomOut roomout={roomOut} />
        </BotRight>
      </BottomContent>
    </AllContent>
  );
};

export default RoomContainer;
