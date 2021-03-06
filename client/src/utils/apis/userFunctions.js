import axios from 'axios';

// ---------Users-------------
export const getUsers = () => {
    return axios
    .get('/api/users', {})
    .then(response => {
        // console.log(response.data);
        // console.log(userData);  
        return response.data
    })
    .catch(err => {
        console.log(err);
    })
}

export const getOneUser = userData => {

    return axios
    .get("/api/users/" + userData.email)
    .then(response => {
        return response.data
    })
}

export const registerUser = userData => {
    // console.log(userData);
    return axios
    .post('/api/register', {
        teamName: userData.teamName,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
        empCost: userData.empCost,
        admin: userData.admin,
        firstLogin: userData.firstLogin
    })
    .then(res => {
        console.log('Registered!');
    })
}

// Change firstLogin to false after a user had logged in once
export const updateLoginStatus = (userID) => {
    return axios
    .put('/api/status/' + userID)
}

export const loginUser = userData => {
    // console.log(userData);
    return axios
    .post('/api/login', {
        email: userData.email,
        password: userData.password
    })
    .then(res => {
        localStorage.setItem('usertoken', res.data);
        return res.data;
    })
    .catch(err => {
        console.log(err);
    })
}

export const removeUser = email => {
    return axios.delete("/api/users/" + email.toLowerCase());
}

// Change user password
export const updatePassword = (updatePasswordData) => {
    return axios
    .put('/api/password/' + updatePasswordData._id, {updatePasswordData})
}

// ---------Teams------------
export const getTeams = () => {

    return axios
    .get("/api/teams")
    .then(response => {
        return response.data
    })
}

export const getOneTeam = teamName => {

    return axios
    .get("/api/teams/" + teamName)
    .then(response => {
        return response.data
    })
}
export const registerTeam = teamData => {

    return axios
    .post("/api/teams", {
        teamName: teamData.teamName,
        adminEmail: teamData.adminEmail,
        engagements: teamData.engagements
    })
    .then(() => {
        console.log("Team Registered!");
    })
}

export const registerEng = engData => {

    return axios
    .put("/api/teams/" + engData.teamName, {
        engName: engData.engName
    })
}

export const getTeamMembers = teamName => {

    return axios 
    .get("/api/members/" + teamName)
    .then(response => {
        return response.data
    })
}
