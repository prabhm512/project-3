import React, { Component } from 'react';
import jwt_decode from 'jwt-decode';
import API from '../../utils/apis/API';
import { registerUser, getUsers, getOneUser, registerEng, getEngs } from '../../utils/apis/userFunctions';
import initialData from '../../components/ReactDND/initial-data';
import './Admin.css';

class Admin extends Component {

    constructor() {
        super()
        this.state = {
            teamName: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            admin: '',
            firstLogin: '',
            engagement: '',
            errors: {}
        }
    }
    token = localStorage.usertoken;
    decoded = jwt_decode(this.token);

    handleValidation = () => {
        let errors = {};
        let formIsValid = true;

        // email
        const inputEmail = this.state.email;
        const emailRegex = /^\w+([\.-]?\w+)*@[a-z]+([\.-]?[a-z]+)*(\.[a-z]{2,4})+$/;
        const emailResult = emailRegex.test(inputEmail);
        if (!this.state.email.trim()) {
            formIsValid = false;
            errors["email"] = "Cannot be empty";
        }
        else if (!emailResult) {
            formIsValid = false;
            errors["email"] = "Email is not valid";
        }
        else {}


        // firstName
        if (!this.state.first_name.trim()) {
            formIsValid = false;
            errors["first_name"] = "Cannot be empty";
        }
        else if (typeof this.state.first_name !== "undefined") {
            if (!this.state.first_name.match(/^[a-zA-Z]+$/)) {
                formIsValid = false;
                errors["first_name"] = "Only letters";
            }
        }
        else {}

        // lastName
        if (!this.state.last_name.trim()) {
            formIsValid = false;
            errors["last_name"] = "Cannot be empty";
        }
        else if (!this.state.last_name.match(/^[a-zA-Z]+$/)) {
            formIsValid = false;
            errors["last_name"] = "Only letters";
        }
        else {}

        this.setState({ errors: errors });
        return formIsValid;
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    }

    // Add new team member to db
    onTeamMemberSubmit = (event) => {
        let errors= {};

        event.preventDefault();
        // console.log(this.decoded);
        const userData = {
            teamName: this.decoded.teamName.trim().toLowerCase(),
            first_name: this.state.first_name.trim(),
            last_name: this.state.last_name.trim(),
            email: this.state.email.trim().toLowerCase(),
            password: 'init01',
            admin: false,
            firstLogin: true
        };

        const validationResult = this.handleValidation();

        if (validationResult) {
            getUsers().then(async data => {
                const destination = data.map(element => {
                    if (element.email === this.state.email.trim().toLowerCase()) {
                        console.log('foundmatch');
                        return true;
                    }
                }).filter(item => { return item; })[0];
                // Check if email exists in db or not
                if (!destination) {
                    registerUser(userData).then(() => {
                        getOneUser(userData).then(async res => {
                            // console.log(res);
                            initialData._id = res[0]._id;
                            await API.createBoard(initialData).catch(err => console.log(err));
                        })
                    })
                    .then(() => {
                        // To clear form input fields on successful user registration
                        this.setState({ 
                            first_name: "",
                            last_name: "",
                            email: ""
                        })
                        console.log("Form submitted");
                    })
                }
                else {
                    errors["email"] = "Email already exists";
                    this.setState({ errors: errors });
                }
            })
        }
    }

    // Add new engagement to db
    onEngagementsSubmit = event => {
        let errors = {};

        event.preventDefault();

        const engData = {
            engName: this.state.engagement.toLowerCase(),
            teamName: this.decoded.teamName.toLowerCase()
        }

        getEngs(engData).then(data => {
            const destination = data.data.map(el => {
                if (el.engName === this.state.engagement.toLowerCase() && el.teamName === this.decoded.teamName.toLowerCase()) {
                    errors['engagement'] = "Your team is already using this name";
                    this.setState({ errors: errors });
                    return true;
                } 
            }).filter(item => { return item; })[0];

            if (!destination) {
                registerEng(engData).then(res => {
                    this.setState({ 
                        engagement: "",
                        errors: ""
                    });
                })
            }
        })

    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <h1 className="heading">Admin ( {this.decoded.teamName} )</h1>
                    </div>
                </div>
                <br></br>
                <div className="row">
                    <div className="col-sm-8">
                        <form onSubmit={this.onTeamMemberSubmit}>
                            <h3>Add Team Members</h3>
                            <div className='form-group'>
                                <label htmlFor='first_name'>First Name</label>
                                <input type='text'
                                    refs='first_name'
                                    className='form-control'
                                    name='first_name'
                                    placeholder='Enter First Name'
                                    value={this.state.first_name}
                                    onChange={this.onChange}
                                />
                                <span style={{ color: "red" }}>{this.state.errors["first_name"]}</span>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='last_name'>Last Name</label>
                                <input type='text'
                                    refs='last_name'
                                    className='form-control'
                                    name='last_name'
                                    placeholder='Enter Last Name'
                                    value={this.state.last_name}
                                    onChange={this.onChange}
                                />
                                <span style={{ color: "red" }}>{this.state.errors["last_name"]}</span>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='email'>Email Address</label>
                                <input type='email'
                                    refs='email'
                                    className='form-control'
                                    name='email'
                                    placeholder='Enter Email'
                                    value={this.state.email}
                                    onChange={this.onChange}
                                />
                                <span style={{ color: "red" }}>{this.state.errors["email"]}</span>
                            </div>
                            <button type='submit' className='btn btn-lg btn-primary btn-block'>Add</button>
                        </form>
                    </div>
                </div>
                <br></br> 
                <div className="row">
                    <div className="col-sm-8">
                        <h3>Add New Engagement</h3>
                        <form onSubmit={this.onEngagementsSubmit}>
                            <div className='form-group'>
                                <label htmlFor='engagement'>Engagement Name</label>
                                <input type='engagement'
                                    refs='engagement'
                                    className='form-control'
                                    name='engagement'
                                    placeholder='Enter Engagement Name'
                                    value={this.state.engagement}
                                    onChange={this.onChange}
                                />
                                <span style={{ color: "red" }}>{this.state.errors["engagement"]}</span>
                            </div>
                            <button type='submit' className='btn btn-lg btn-primary btn-block'>Add</button>
                        </form>
                    </div>
                </div>          
            </div>
        )
    }
}

export default Admin;