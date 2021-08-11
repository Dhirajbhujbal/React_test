import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import MaterialTable from 'material-table'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import Avatar from '@material-ui/core/Avatar';
import  { PRIMARY_COLOR }  from './Config';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(5),
    color: theme.palette.text.secondary,
  },
  textField: {
    marginBottom: theme.spacing(4)
  }
}));


function App() {
  const url = "http://localhost:4000/students"
  const [data, setData] = useState([])

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };



  useEffect(() => {
    getStudents()
  }, [])

  // take this method out of this functional componnet, as it has nothing to component lifecycle then inside the useEffect set your State
  // getStudents().then( (studentArray) => setData(studentArray) )
  
  const getStudents = async () => {

    try {
      let myarray = []
      const resp = await axios.get('/api/getall');

      for(let i = 0;i < resp.data.characters.length;i++){
      myarray.push(JSON.parse(resp.data.characters[i]))
      }

      setData(myarray.reverse())

  } catch (err) {
      console.error(err);
  }
}


  const columns = [
    { title: "Emp ID", field: "emp_id", validate: rowData => rowData.emp_id === undefined || rowData.emp_id === "" ? "Required" : true },
    { title: "Name", field: "emp_name", validate: rowData => rowData.emp_name === undefined || rowData.emp_name === "" ? "Required" : true,
      render: (rowData) => <div style={{ display: 'flex', alignItems: 'center'}}>

      <div>
      <Avatar style={{ backgroundColor: PRIMARY_COLOR }}>{rowData.emp_name[0].toUpperCase()}</Avatar>
      </div>
        &nbsp;&nbsp;&nbsp;
      <div> {rowData.emp_name} </div>
         
          
      </div>
  
  },
    {
      title: "Email", field: "email_id",
      validate: rowData => {
        var re = /\S+@\S+\.\S+/;
        if(rowData.email_id === undefined || rowData.email_id === "") {
          return "Required";
        }else if(!rowData.email_id.includes('gslab')) {
          return "Email address not match with your organization"
        }
        else if(! re.test(rowData.email_id)) {
          return "Please enter valid email address."
        }
        return true;
      }
    },
    {
      title: "Designation", field: "designation",
      validate: rowData => rowData.designation === undefined || rowData.designation === "" ? "Required" : true
    },
    {
      title: "Department", field: 'department',
      validate: rowData => rowData.department === undefined || rowData.department === "" ? "Required" : true
    }]

    // console.log(data)
  return (
    <div className="App">
            <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <Header/>
      </Grid>

      <Grid item xs={6} sm={0}></Grid>
              <Grid item xs={12} sm={12}>
      <MaterialTable
        title="Employee Details"
        columns={columns}
        data={data}
        options={{ actionsColumnIndex: -1, addRowPosition: "first", exportButton: true }}
        editable={{
          onRowAdd: ( newData ) => new Promise((resolve, reject) => {
            // console.log(newData)
            // console.log(data)

        const EmployeeIDfound = data.some(el => el.emp_id === newData.emp_id);
        const EmailIDFound = data.some(el => el.email_id === newData.email_id);
        if(EmployeeIDfound) {
          alert(`Employee ID ${newData.emp_id} already exists. Kindly use different employee ID.`)
          getStudents()
          resolve()
        }else if(EmailIDFound) {
          alert(`Email ID ${newData.email_id} already exists. Kindly use different email ID.`)
          getStudents()
          resolve()
        }
        else{
            //backend call
            fetch("/api/add", {
              method: "POST",
              headers: {
                'Content-type': "application/json"
              },
              body: JSON.stringify(newData)
            }).then(resp => console.log(""))
              
                getStudents()
                resolve()
          }
          }),
          onRowUpdate: (newData, oldData) => new Promise((resolve, reject) => {
            //backend call
            fetch(url + "/" + oldData.id, {
              method: "PUT",
              headers: {
                'Content-type': "application/json"
              },
              body: JSON.stringify(newData)
            }).then(resp => resp.json())
              .then(resp => {
                getStudents()
                resolve()
              })
          }),
          onRowDelete: (oldData) => new Promise((resolve, reject) => {
            console.log(oldData)
            //backend call
            const deleteData = {
              "characterId": oldData._id.$oid
            }
            fetch("/api/delete", {
              method: "POST",
              headers: {
                'Content-type': "application/json"
              }, 
            body: JSON.stringify(deleteData)
            }).then(resp => console.log(""))
              
                getStudents()
                resolve()
              
          })
        }}

  
      />
         </Grid>
             <Grid item xs={6} sm={0}></Grid>

      </Grid>
    </div>
  );
}

export default App;
