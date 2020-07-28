import Page from '../components/Page';
import React from 'react';
import {Card, Table, CardBody, CardHeader, Row, Col} from "reactstrap";
import "../styles/_sanfona.scss"
import { IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline } from 'react-icons/io';
import { render } from "react-dom";


export class TestItem extends React.Component{
  constructor(props){
    super(props);
    this.state = {testInfo: null};
    this.allSteps = [];
  }

  cancelUpdate(){
    clearInterval(this.interval);
  }

  async componentDidMount() {
    this.interval = setInterval(
        async () => {
          await fetch(
              "http://localhost:8000/api/test/execution-steps/" + this.props.id,
              {method: 'get'}
              ).then(res => res.json())
              .then(test_data => {
                if (test_data) {
                  if(test_data.result === "pass"){
                    this.props.updatePassStep(test_data.step);
                    if(this.allSteps.indexOf(test_data.step) < 0){
                      this.allSteps.push(test_data.step);
                      this.allSteps.sort();
                      if(this.allSteps.length === 3 && this.allSteps[0] === "call" && this.allSteps[1] === "setup" && this.allSteps[2] === "teardown" ){
                        this.cancelUpdate();
                      }
                    }
                  }else if(test_data.result === "fail"){
                    this.props.updateFail();
                    this.cancelUpdate();
                  }
                  this.setState({testInfo: test_data});
                }else{
                  this.setState({testInfo: null});
                }
              });
        },
        1000
    );

  }

  componentWillUnmount() {
    this.cancelUpdate();
  }

  render(){
    if(!this.state.testInfo){
      return (<tr><th scope="row"></th><th></th><th></th><th></th><th></th><th></th></tr>);
    }
    var result_color = "yellow";
    if("pass" === this.state.testInfo.result){
      result_color = "green";
    }else if("fail" === this.state.testInfo.result){
      result_color = "red";
    }
    return (
      <tr>
        <th scope="row">{this.state.testInfo.step}</th>
        <th style={{color: result_color}}>{this.state.testInfo.result}</th>
        <th>{this.state.testInfo.step}</th>
        <th>{this.state.testInfo.duration}</th>
        <th>{this.state.testInfo.error_msg}</th>
        <th>{this.state.testInfo.extra_info}</th>
      </tr>
    );

  }
}


export class AccordionItem extends React.Component{
  constructor(props){
    super(props);
    this.state = {row_test: {execution_steps: []}, opened: false, didFail: false, finishedSteps: []};
    this.updateFail = this.updateFail.bind(this);
    this.updatePassStep = this.updatePassStep.bind(this);
  }

  async componentDidMount() {
    this.interval = setInterval(
        async () => {
          await fetch(
              "http://localhost:8000/api/test/execution/" + this.props.id,
              {method: 'get'}
              ).then(res => res.json())
              .then(test_data => {
                if (test_data) {
                  this.setState({row_test: test_data});
                }else{
                  this.setState({row_test: {execution_steps: []}});
                }
              });
        },
        1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateFail(){
    this.setState({didFail: true})
  }

  updatePassStep(step){
    if(!step){
      return
    }
    if(this.state.finishedSteps.indexOf(step) >= 0){
      return
    }
    if(step === 'call' || step === 'teardown' || step === 'setup'){
      var new_arr = this.state.finishedSteps;
      new_arr.push(step);
      new_arr.sort();
      this.setState({finishedSteps: new_arr});
    }
  }


  render(){
    var icon_test = <div className="loader"/>;
    if (this.state.didFail) {
      icon_test = (<IoIosCloseCircleOutline style={{color: "red", width: "60px", height: "60px"}} />);
    } else if (this.state.finishedSteps.length === 3 && this.state.finishedSteps[0] === 'call' && this.state.finishedSteps[1] ===  'setup' && this.state.finishedSteps[2] ===  'teardown') {
      icon_test = (<IoIosCheckmarkCircleOutline style={{color: "green", width: "50px", height: "50px"}} />);
    }
    console.log(this.state.row_test);
    return (
      <div
        {...{
          className: `accordion-item, ${this.state.opened && 'accordion-item--opened'}`,
          onClick: () => { this.setState({ opened: !this.state.opened }) }
        }}
      >
        <div {...{ className: 'accordion-item__line' }}>
          <h3 {...{ className: 'accordion-item__title' }}>
            <div className="title-loader">
              {icon_test}{this.state.row_test ? this.state.row_test.pytest_id : ""}
            </div>
          </h3>
          <span {...{ className: 'accordion-item__icon' }}/>
        </div>
          <div {...{ className: 'accordion-item__inner' }}>
            <div {...{ className: 'accordion-item__content' }}>
              <p {...{ className: 'accordion-item__paragraph' }}>
                <Table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Result</th>
                      <th>Step</th>
                      <th>Duration</th>
                      <th>Error Message</th>
                      <th>Extra Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.row_test.execution_steps.map(
                        id_step => <TestItem id={id_step} updateFail={this.updateFail} updatePassStep={this.updatePassStep}/>
                        )}
                  </tbody>
                </Table>
              </p>
            </div>
          </div>
      </div>
    );
  }
}


export class Accordion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {machine: {test_execution: []}};
  }

  async componentDidMount(){
    this.interval = setInterval(
        async () => {
          await fetch(
              "http://localhost:8000/api/test/machine/" + this.props.id,
              {method: 'get'}
              ).then(res => res.json())
              .then(data => {
                if (data) {
                  this.setState({machine: data});
                }else{
                  this.setState({machine: {test_execution: []}});
                }
              });
        },
        1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <Row key={this.props.id}>
        <Col>
          <Card body>
            <div {...{ className: 'wrapper' }}>
              Server - {this.state.machine.hostname}; {this.state.machine.release}; {this.state.machine.version}; {this.state.machine.machine}
              <ul {...{ className: 'accordion-list' }}>
                {this.state.machine.test_execution.map((data, key) => {
                  return (
                    <li {...{ className: 'accordion-list__item', key }}>
                      <AccordionItem id={data}/>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Card>
      </Col>
    </Row>
    );
  }
}

class TestStatusPage extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      all_batches: [{id: 1}],
    };
  }

  // async componentDidMount(){
  //   this.interval = setInterval(
  //       async () => {
  //         await fetch(
  //             "http://localhost:8000/api/test/manager/" + this.props.id,
  //             {method: 'get'}
  //             ).then(res => res.json())
  //             .then(data => {
  //               if (data) {
  //                 this.setState({test_list: data});
  //               }else{
  //                 this.setState({test_list: []});
  //               }
  //             });
  //       },
  //       1000
  //   );
  // }

  render() {
  return (
    <Page
      title="Test Status"
      breadcrumbs={[{ name: 'Test Status', active: true }]}>
     {this.state.all_batches.map(one_batch_test => <Accordion id={one_batch_test.id} key={one_batch_test.id}/>)}
    </Page>
    );
  }
}




export default TestStatusPage;
