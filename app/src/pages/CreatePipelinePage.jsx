import Page from '../components/Page';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import {DefaultNodeModel} from '@projectstorm/react-diagrams';

import {
    CanvasWidget
} from '@projectstorm/react-canvas-core';
import {
    CardBody,
    Col,
    Row,
    Card,
    CardHeader,
} from "reactstrap";
import "../styles/components/_canvas.scss"
import * as SRD from '@projectstorm/react-diagrams';


export class ApplicationMenu extends React.Component {
    constructor(props) {
        super(props);
        this.diagramEngine = SRD.default()
        this.newModel();
    }

    newModel() {
        this.activeModel = new SRD.DiagramModel();
        this.diagramEngine.setModel(this.activeModel);

        // var node1 = new SRD.DefaultNodeModel('Node 1', 'rgb(0,192,255)');
        // let port = node1.addOutPort('Out');
        // node1.setPosition(100, 100);
        //
        // var node2 = new SRD.DefaultNodeModel('Node 2', 'rgb(192,255,0)');
        // let port2 = node2.addInPort('In');
        // node2.setPosition(400, 100);
        //
        // let link1 = port.link(port2);
        // this.activeModel.addAll(node1, node2, link1);
    }

    getActiveDiagram() {
        return this.activeModel;
    }

    getDiagramEngine() {
        return this.diagramEngine;
    }
}

export class TrayWidget extends React.Component {
    render() {
        return <div id="tray_menu">{this.props.children}</div>
    }
}

export class TrayItemWidget extends React.Component {
    render() {
        return (
            <div id="tray_item_menu"
                 draggable={true}
                 onDragStart={(event) => {
                     event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props));
                 }}
                 className="tray-item"
            >
                {this.props.name}
            </div>
        );
    }
}


export class BodyWidget extends React.Component {
    state = {builtin_component: null, loading: true};

    async componentDidMount () {
        var url = "http://localhost:8000/api/graph/components/";
        const requestOptions = {
          method: "GET",
          headers: {"Content-Type": "application/json"}
        };
        await fetch(url, requestOptions)
            .then(response => response.json())
            .then(data => {
                this.setState({"builtin_component": data, "loading": false});
                console.log(data);
            });
    }

    render() {
        let result_tray = [];
        console.log(this.state.builtin_component);
        for (var t in this.state.builtin_component){
            const name = t.name ? t.name : t.function_name;
            console.log(t);
            result_tray.push(generateComponentNode(this.state.builtin_component[t]));
        }
        return (
            <div id="body_menu">
                <div id="content_menu">
                    <TrayWidget>
                        {result_tray}
                    </TrayWidget>
                </div>
            </div>
        );
    }

}

const generateComponentNode = (prop) => {
    var tip = prop["description"]
    return (
    <div>
        <a data-for="main" data-tip={tip}>
            <TrayItemWidget  model={{data: prop}} name={prop["name"]} color="rgb(192,255,0)"/>
        </a>
        <ReactTooltip
            id="main"
            place='top'
            type='dark'
            effect='solid'
            multiline={true} />
    </div>
  );
}

export class CreatePipelinePage extends React.Component {
    constructor(props) {
        super(props);
        this.app = new ApplicationMenu();
    }
    render(){
        return (
        <Page
            title="Create Pipeline"
            breadcrumbs={[{name: 'Create Pipeline', active: true}]}
            style={{height: "100%"}}
        >
            <Row style={{height: "100%"}}>
                <Col style={{height: "100%"}}>
                    <Card style={{height: "100%"}}>
                        <CardHeader>Pipeline</CardHeader>
                        <CardBody style={{height: "100%"}}>
                            <div id="layer_menu" onDrop={(event) => {
                        var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));

                        var node = null;
                        node = new DefaultNodeModel(data.name, 'rgb(192,100,100)');
                        if (data.model.data.inputs){
                            data.model.data.inputs.map(i => {
                                const n = i["name"] ? i["name"] : i["var_name"];
                                node.addInPort(n + "[" + i["type_hint"] + "]");
                            });
                        }
                        if (data.model.data.outputs){
                            data.model.data.outputs.map(i => {
                                const n = i["name"] ? i["name"] : i["var_name"];
                                node.addOutPort(n + "[" + i["type_hint"] + "]");
                            });
                        }

                        var point = this.app.getDiagramEngine().getRelativeMousePoint(event);
                        node.setPosition(point);
                        this.app.getDiagramEngine().getModel().addNode(node);
                        this.forceUpdate();
                    }}
                         onDragOver={(event) => {
                             event.preventDefault();
                         }}>
                           <CanvasWidget className="canvas"
                                engine={this.app.getDiagramEngine()}/>
                        </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xs="auto">
                    <Card>
                        <CardHeader>Components</CardHeader>
                        <CardBody>
                           <BodyWidget app={this.app}  />
                        </CardBody>
                    </Card>
                </Col>


            </Row>
        </Page>
    );
    }


};

export default CreatePipelinePage;

