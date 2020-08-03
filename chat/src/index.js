import React from 'react'
import ReactDOM from '/react-dom'
import styles from '/style.js'

// Socket.IO로 웹 소켓 서버 접속하기 ---(#1)
// 서버의 모듈 이름이 socket.io 모듈이 었던과 달리 클리이언트 모듈이름은 "socket.io-client"이다.

import socketio from 'socket.io-client'
const socket = socketio.connect('http://localhost:3001')

/*입력 양식 컴포넌트 --- (#2)
 입력양식 컴포넌트 정의. 이 컴포넌트는 이름과 메세지라는 2개의 input 요소를 사용
 따라서 constructor() 메서드 내부에서 2개의 state를 초기화 했다. */
class ChatForm extends React.Component {
    constructor (props) {
        super(props) // 부모 클래스 생성자를 가리킴 (React.Component)
        this.state = {name: '', message: ''}
    }
    nameChange (e) { 
        this.setState({name: e.target.value})
    }
    messageChanged (e) {
        this.setState({message: e.target.value})
    }

    /* 서버에 이름과 메세지 전송 ---(#3)
       "전송" 버튼을 눌렀을 때의 처리 내용
       여기서 웹 소켓 서버에 "chat.msg"라는 사용자 정의 메세지를 전송한다.
       이때 name과 message 속성을 가진 객체를 전달했다.
    */ 
    send() {
        socket.emit('chat-msg', {
            name: this.state.name,
            message: this.state.message
        })
        this.setState({message: ''}) // 입력 양식을 비웁니다.
    }
}

/* 채팅 애플리케이션의 메인 컴포넌트를 정의합니다. --- (#4)
   메인컴포넌트에서 채팅 로그를 출력하는 처리가 메인이므로 state로 logs 속성을 초기화했다.
*/
class ChatApp extends React.Component {
    constructor (props) {
        super (props)
        this.state = {
            logs: []
        }
    }

    /*컴포넌트가 마운트됐을 때 --- (#5)
    이 때 웹 소켓 서버에서 메세지를 수신 받는다. 'char-msg'라는 종류의 메세지를 받으면
    state의 logs를 변경한다. 이 때, 채팅 로그 하나하나를 판별할 수 있게 key라는 property를 추가
    이 key는 유일성을 가져야 하므로 채팅 로그의 수를 기반으로 ID처럼 사용하게 했다.
    */
    componentDidMount () {
        //실시간으로 로그를 받게 설정
        socket.on('chat-msg', (obj) => {
            const logs2 = this.state.logs
            obj.key = 'key_' + (this.state.logs.length + 1)
            console.log(obj)
            logs2.unshift(obj) //로그에 추가하기
            this.setState({logs: logs2})
        })
    }
    render() {
        // 로그를 사용해 HTML 요소 생성 --- #6
        const  message = this.state.logs.map(e => (
            <div key ={e.key} style={styles.log}>
                <span style = {styles.name}>{e.name}</span>
                <span style = {styles.msg}>:{e.message}</span>
                <p style = {{clear: 'both'}}/>
            </div>
        ))
        return (
            <div>
                <h1 style = {styles.h1}>실시간 채팅</h1>
                <ChatForm />
                <div>{message}</div>
            </div>
        )
    }
}

// DOM의 내용을 메인 컴포넌트로 변경합니다.
ReactDOM.render(
    <ChatApp />,
    document.getElementById('root'))
