import React, { Component } from 'react';
import Tabs from './components/Tabs'
import { JsonToTable } from "react-json-to-table";
//import mongoose from 'mongoose/browser';

require('./styles.css');
class App extends Component{
  startInterval = 0;
  constructor(props){
    super(props);


    this.state = {
      bruteForceType: "light",
      nmapOption: "nmap --unprivileged -vv",
      bruteForcePath: "",
      publicKeyAuthentication: false,
      username: "",
      password: "",
      publicKeyPath: "",
      sshPort: "22",
      targets: [],
      target: "",
      scan_started: false,
      scan_status: -1,
      sync_status: -1,
      scan_id: -1,
      show_report: false,
      report0: {},
      report1: {},
      excluding_functions: [],
      excluding_function: "",
    };
    this.handlePassword = this.handlePassword.bind(this);
    this.handlePublicKeyPath = this.handlePublicKeyPath.bind(this);
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePublicKeyAuthentication = this.handlePublicKeyAuthentication.bind(this);
    this.handleAddToTargets = this.handleAddToTargets.bind(this);
    this.handleTarget = this.handleTarget.bind(this);
    this.handleExcludingFunction = this.handleExcludingFunction.bind(this);
    this.handleSshPort = this.handleSshPort.bind(this);
    this.handleBruteForcePath = this.handleBruteForcePath.bind(this);
  }
  componentDidMount(){
  }
  componentWillUnmount(){
    clearInterval(this.startInterval);
  }
  postAxios(){
    
    fetch('http://127.0.0.1:8000')
    .then(res => {
      console.log("res: ",res)
      res.json().then(val => console.log("val: ",val))
    });
  }

  async isSyncOver()
  {
    try{
      const response = await fetch('http://127.0.0.1:8001/sync/status', 
      
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: "scanid"
        })
      });
      //const res = response.text();
      const response_json = await response.json();
      this.setState({sync_status: 3, sync_started: false})
      return response_json["status"];
    }
    catch(err){
      console.log("err: ", err);
    }
  }
  async postGetStatus(scanid){
    try{
      const response = await fetch('http://127.0.0.1:8001/scan/status', 
      
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: scanid
        })
      });
      //const res = response.text();
      const response_json = await response.json();
      console.log("response_json['status']: ", response_json)
      const xd = JSON.parse(JSON.stringify(response_json));
      console.log("xd: ", xd);
      
      if(xd == 3){
        this.setState({scan_status: 3, scan_started: false})
        //alert("Scan is over, you can check the result!");
        return xd;
      }
    }
    catch(err){
      console.log("err: ", err);
    }
    return -1;
  }
  async postReq(isSync){
      if(!isSync)
      {
          var scanid;
          var targetsArr = "[\""; 
          for(let i = 0; i < this.state.targets.length; i++){
              if(i == this.state.targets.length -1){
                targetsArr = targetsArr + this.state.targets[i]+"\"]";
              }
              else{
                targetsArr = targetsArr + this.state.targets[i] + "\", \"";
              }
          }
          var excludingsArr = "[\""; 
          for(let i = 0; i < this.state.excluding_functions.length; i++){
              if(i == this.state.excluding_functions.length -1){
                excludingsArr = excludingsArr + this.state.excluding_functions[i]+"\"]";
              }
              else{
                excludingsArr = excludingsArr + this.state.excluding_functions[i] + "\", \"";
              }
          }
          if(this.state.excluding_functions.length == 0)
            excludingsArr = "[\"\"]"
          var data = '{\"ssh-username\":\"'+this.state.username+
          '\", \"ssh-password\":\"'+this.state.password+
          '\", \"ssh-port\":\"'+this.state.sshPort+
          '\", \"targets\":' +targetsArr+
          ', \"nmap\":\"' + this.state.nmapOption +
          '\", \"brute-force-path\":\"'+this.state.bruteForcePath+
          '\", \"excluding_functions\":'+ excludingsArr+
          ', \"brute-force-type\":\"'+this.state.bruteForceType+'\"}'

          console.log("data is: ", data)
          try{
              const response = await fetch('http://127.0.0.1:8001/scan/new', 
              {
                method: 'POST',
                //mode: 'no-cors', //methodu cors yaparsam "net::ERR_EMPTY_RESPONSE" hatasi aliyorum, no-cors yaparsam fetch basarılı oluyor fakat response.json() hata veriyor
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  data: data
                })
              });
              //const res = response.text();
              const response_json = await response.json();
              scanid = response_json["$oid"]
              this.setState({scan_id: scanid})
              console.log("response_json: ",response_json["$oid"])
          }
          catch(err){
                console.log("err: ", err);
          }
          if(this.state.scan_status != 3){
            this.startInterval = setInterval(() => {
              var status = this.postGetStatus(scanid);
              console.log("status: ", status)
              if(this.state.scan_status == 3){
                this.setState({show_report: true});
                console.log("status is 3")
              }
              else{
                console.log("status is not 3;")
              }
            }, 2000);
            }
      }
    else
    {
      try{
        const response = await fetch('http://127.0.0.1:8001/sync/data', 
        {
          method: 'POST',
          //mode: 'no-cors', //methodu cors yaparsam "net::ERR_EMPTY_RESPONSE" hatasi aliyorum, no-cors yaparsam fetch basarılı oluyor fakat response.json() hata veriyor
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            data: data
          })
        });
        //const res = response.text();
        const response_json = await response.json();
        scanid = response_json["$oid"]
        this.setState({scan_id: scanid})
        console.log("response_json: ",response_json["$oid"])
      }
      catch(err){
        console.log("err: ", err);
      }
      var status = this.isSyncOver();
      this.setState({sync_started: false});
      //alert("Successfuly downloaded datas from server!");
      /*this.startInterval = setInterval(() => {
        
        console.log("status: ", status)
        if(this.state.sync_status == 3){
          this.setState({sync_started: false});
          console.log("status is 3")
        }
        else{
          console.log("status is not 3;")
        }
      }, 2000);*/
    }
  }
  async handleShowReport(){
   try{
     const response = await fetch('http://127.0.0.1:8001/report/get', 
     {
       method: 'POST',
       //mode: 'no-cors', //methodu cors yaparsam "net::ERR_EMPTY_RESPONSE" hatasi aliyorum, no-cors yaparsam fetch basarılı oluyor fakat response.json() hata veriyor
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         id: this.state.scan_id
       })
     });
     //const res = response.text();
     const response_json = await response.json();
     console.log("response_json:", response_json);
     console.log("report0:", response_json["0"]);
     this.setState({report0: response_json["targets"]["0"], report1: response_json["targets"]["1"], show_report: false})
   }
   catch(err){
     console.log("err: ", err);
   }
  }

  handleClearTargets(){
    this.setState({targets: []});
  }

  handleAddToTargets(){
    let list = this.state.targets;
    list.push(this.state.target);
    this.setState({targets: list, target:""});
  }

  handleAddToExcludingFunctions(){
    let list = this.state.excluding_functions;
    list.push(this.state.excluding_function);
    this.setState({excluding_functions: list, excluding_function:""});
  }


  handleSync()
  {
    this.setState({sync_started: true});
    this.postReq(true);
  }
  handleClick(){
    
    if(this.state["username"].length === 0){
      alert("username is empty pls add username!")
    }else if(this.state['targets'].length === 0){
      alert("targets empty pls add some targets from scan options page!")
    }
else if(!this.state.publicKeyAuthentication && this.state['password'].length === 0){
      alert("password is empty pls add password!")
    }
    else if(this.state.publicKeyAuthentication && this.state["publicKeyPath"].length === 0){
      alert("Public key path is empty pls add path!")
    }
    for(var key in this.state){
      console.log(key,": ",this.state[key]);
    }
    this.setState({scan_started:true})
    this.postReq(false);
  }

  handleTarget(event){
    this.setState({target: event.target.value});
  }

  handleExcludingFunction(event){
    this.setState({excluding_function: event.target.value});
  }

  setBruteForceType(event) {
    this.setState({bruteForceType: event.target.value});
  }

  setNmapOption(event){
    this.setState({nmapOption: event.target.value});
  }

  handlePassword(event){
    this.setState({password: event.target.value})
  }

  handlePublicKeyPath(event){
    this.setState({publicKeyPath: event.target.value})
  }

  handleUsername(event){
    this.setState({username: event.target.value})
  }

  handlePublicKeyAuthentication(){
    this.setState({publicKeyAuthentication: !this.state.publicKeyAuthentication})
  }

  handleSshPort(event){
    this.setState({sshPort: event.target.value})
  }
  handleBruteForcePath(event)
  {
    this.setState({bruteForcePath: event.target.value})

  }
  render(){
    let passwordOrPublicKey;
    let targetsPrint;
    let excludingsPrint;
    if(!this.state.publicKeyAuthentication){
      passwordOrPublicKey = <label> Password: <input type="text" value={this.state.password} onChange={this.handlePassword} /> </label>;
    }
    else{
      passwordOrPublicKey = <label> Public Key Path: <input type="text" value={this.state.publicKeyPath} onChange={this.handlePublicKeyPath} /> </label>;
    }
    if(this.state.targets.length === 0){
      targetsPrint = <label> There are no targets!</label>
    }
    else{
      targetsPrint = <label>Targets: <br/>
        <ul>
          {this.state.targets.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        </label>
    }
    if(this.state.excluding_functions.length === 0){
      excludingsPrint = <label> There are no excluding function!</label>
    }
    else{
      excludingsPrint = <label>Excluding functions: <br/>
        <ul>
          {this.state.excluding_functions.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        </label>
    }
    let scan_started_or_not;
    let sync_started_or_not;
    if(!this.state.scan_started){
      scan_started_or_not = <button onClick={this.handleClick.bind(this)}>
      Start
      </button>
    }
    else{
     scan_started_or_not =  <label>Scanning...</label>
    }
    if(!this.state.sync_started)
    {
      sync_started_or_not = <button onClick = {this.handleSync.bind(this)}>
        Sync Data From Server
      </button>
    }
    else{
      sync_started_or_not = <label>Sync started, downloading datas...</label>
    }
    let show_report_button;
    if(this.state.show_report){
      show_report_button=<button onClick={this.handleShowReport.bind(this)}>
      Report is ready, show report!
      </button>
    }
    var myJson;
    if(Object.keys(this.state.report0).length != 0){
      console.log("this.state.report: ", this.state.report);
      //myJson = this.state.report;
    }
    
    return (
      <div>
        <h1>ZTP</h1>
       <Tabs>
        <div label="Main Page">
         {scan_started_or_not}
         {sync_started_or_not}
         {show_report_button}
          <JsonToTable json={this.state.report0} />
          <br />
          <br />
          <JsonToTable json={this.state.report1} />
        </div>
        <div label="Scan Options">
        <label>Use Public Key Authentication <input type="checkbox" defaultChecked={this.state.publicKeyAuthentication} onChange={this.handlePublicKeyAuthentication} /> </label>
        <br />
        <label> Username: <input type="text" value={this.state.username} onChange={this.handleUsername} /> </label>
        {passwordOrPublicKey}
            <br />
            <br />
        <label> SSH Port: <input type="text" value={this.state.sshPort} onChange={this.handleSshPort} /> </label>
            <br />
            <br />
         Select Brute Force Type
          <div onChange={this.setBruteForceType.bind(this)}>
            <input type="radio" value="light" name="bruteforce" checked={this.state.bruteForceType === "light"}/> light
            <input type="radio" value="medium" name="bruteforce"checked={this.state.bruteForceType === "medium"}/> medium
            <input type="radio" value="heavy" name="bruteforce"checked={this.state.bruteForceType === "heavy"}/> heavy
            <input type="radio" value="optional" name="bruteforce"checked={this.state.bruteForceType === "optional"}/> optional
          </div>
            <br />
            <br />
          Enter Brute Force File Path (Needed to check optional, otherwise this wont be active.) (Example path: /home/username/passwords.txt)
          <br />
          <br />
        <label>Path: <input type="text" value={this.state.bruteForcePath} onChange={this.handleBruteForcePath} /> </label>
            <br />
            <br />
         Select Nmap Option
          <div onChange={this.setNmapOption.bind(this)}>
            <input type="radio" value="nmap --unprivileged -vv" name="nmap" checked={this.state.nmapOption === 'nmap --unprivileged -vv'}/> nmap --unprivileged -vv
            <input type="radio" value="nmap -sS -T4" name="nmap"checked={this.state.nmapOption === 'nmap -sS -T4'}/> nmap -sS -T4
        </div> 
        <br/> 
        <br/>
        <label> Excluding Function: <input type="text" value={this.state.excluding_function} onChange={this.handleExcludingFunction} /> </label>
        <button onClick={this.handleAddToExcludingFunctions.bind(this)}>
            Add To Excluding Functions
          </button>
          <br />
        {excludingsPrint}
        <br/>
        <br/>
        <label> Target: <input type="text" value={this.state.target} onChange={this.handleTarget} /> </label>
        <button onClick={this.handleAddToTargets.bind(this)}>
            Add To Targets
          </button>
          <br />
        {targetsPrint}
          
        </div>
      </Tabs>
      </div>
    );
  }
}


export default App;