import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
// import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import jwt_decode from 'jwt-decode';
import { Link, withRouter } from "react-router-dom";

import './style.css';

const useStyles = makeStyles({
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
});

function TemporaryDrawer(props) {

    const classes = useStyles();
    const [state, setState] = useState({
        right: false
    });

    let token, decoded;
    
    if (localStorage.usertoken) {
        token = localStorage.usertoken;
        decoded = jwt_decode(token);
    }

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        
        setState({ ...state, [anchor]: open });
    };

    //Log user out
    const logOut = e => {
        e.preventDefault();
        localStorage.removeItem('usertoken');
        props.history.push('/');
    }
    
    const userList = anchor => (
        <div
        className={clsx(classes.list, {
            [classes.fullList]: anchor === 'top' || anchor === 'bottom',
        })}
        role="presentation"
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
        >
            {localStorage.usertoken ? (
                // <List>
                //     {['Home', 'Tasks', 'Logout'].map((text, index) => (
                //         <Link key={text} to={text}>
                //             <ListItem button key={text}>                    
                //                     {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
                //                     <ListItemText primary={text} />
                //             </ListItem>
                //         </Link>
                //     ))}
                // </List>
                <List>
                    <Link to={'/'}>
                        <ListItem button>
                            <ListItemText primary='Home' />
                        </ListItem>
                    </Link>
                    <Link to={'/tasks'}>
                        <ListItem button>
                            <ListItemText primary='Tasks' />
                        </ListItem>
                    </Link>
                    {decoded.admin ? (
                        <div>
                            <Link to={'/admin'}>
                                <ListItem>
                                    <ListItemText primary='Admin' />
                                </ListItem>
                            </Link>
                            <Link to={'/team'}>
                                <ListItem>
                                    <ListItemText primary='Team' />
                                </ListItem>
                            </Link>
                        </div>
                    ) : (
                        <Link to={'/team'}>
                            <ListItem>
                                <ListItemText primary='Team' />
                            </ListItem>
                        </Link>
                    )}
                    <ListItem button onClick={props.handleShowCB}>
                        <ListItemText primary='Reset Pwd' />
                    </ListItem>
                    <ListItem button onClick={logOut.bind(this)}>
                        <ListItemText primary='Logout' />
                    </ListItem>

                </List>
            ): 
            (
                <List>
                    <Link to={'/'}>
                        <ListItem button>
                            <ListItemText primary='Home' />
                        </ListItem>
                    </Link>
                    <Link to={'/login'}>
                        <ListItem button>
                            <ListItemText primary='Login' />
                        </ListItem>
                    </Link>
                    <Link to={'/register'}>
                        <ListItem button>
                            <ListItemText primary='Register' />
                        </ListItem>
                    </Link>
                </List>
            )}
            {/* <Divider />
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List> */}
        </div>
    );  
                
    return (
        <div>
            <nav className='navbar navbar-expand-lg'>
                <div className='collapse navbar-collapse d-flex justify-content-end' id='navbar1'>
                {[`right`].map((anchor) => (
                    <React.Fragment key={anchor}>
                        <Button onClick={toggleDrawer(anchor, true)}><MenuIcon /></Button>
                        <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
                            {userList(anchor)}
                        </Drawer>
                    </React.Fragment>
                ))}
                </div>
            </nav>
        </div>
    );
}
                    
export default withRouter(TemporaryDrawer);