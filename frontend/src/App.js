import React from 'react';
import Toolbar from "./component/Toolbar/Toolbar";

import MainPage from "./container/mainPage/mainPage";
import {Container} from 'reactstrap'
import {Route,Switch,Redirect} from 'react-router-dom'
import Register from "./container/Register/Register";
import Login from "./container/Login/Login";
import {useSelector} from "react-redux";




function App() {
    const user = useSelector(state => state.users.user);
  return (
    <div className="App">
        <header>
            <Toolbar/>
        </header>
        <Container>
            <Switch>


                <Route path="/register" exact component={Register}/>
                <Route path="/login" exact component={Login}/>
                {(user === null ? <Redirect to={{pathname: '/login'}}/> : <Route path="/" exact component={MainPage}/>)}
            </Switch>
        </Container>
    </div>
  );
}

export default App;
