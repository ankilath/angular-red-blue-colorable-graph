import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  form: FormGroup = this.fb.group({
    graphInput: ['', Validators.required],
  });

  graph;
  stack: string[];
  redColor: boolean = true;
  prevColor = null;
  isColorable = true;
  result: string = '';

  constructor(private fb: FormBuilder) {}

  onSubmit(text: string) {
    this.initializeValues();
    if (this.form.valid) {
      const separateNodes = this.organiseInput(text);
      separateNodes.forEach((ele) => {
        this.separateInnerNodes(ele);
      });
      let keys_set = this.graph.keys();
      this.isVisitedNode([...keys_set][0]);
      this.traverseNodes();
      for (let i of this.graph.keys()) {
        let flag = this.graph.get(i).visited;
        if (!flag) {
          this.result = 'Is not a connected graph';
          return;
        }
      }
      if (!this.isColorable)
        this.result = 'Is a connected graph, but not red blue colorable';
      else this.result = 'Is a connected and red-blue colorable graph';
    }
  }

  initializeValues() {
    this.graph = new Map();
    this.stack = [];
    this.result = '';
    this.redColor = true;
    this.isColorable = true;
  }

  // Assuming the input string will have either a new line or a
  //comma separation between paths
  organiseInput(text: string) {
    if (text.includes(',')) return text.split(',');
    else return text.split('\n');
  }

  // To check if node is already visited
  isVisitedNode(adjKey: string) {
    if (!this.graph.get(adjKey).visited) {
      this.graph.get(adjKey).visited = true;
      this.stack.push(adjKey);
    } else {
      if (this.prevColor == this.graph.get(adjKey).color)
        this.isColorable = false;
    }
  }

  // To traverse nodes and assign alternate color to each
  // Also checks previous color matches the current node color
  traverseNodes() {
    if (this.stack.length != 0) {
      let item = this.stack.pop();
      this.graph.get(item).color = this.redColor;
      this.redColor = !this.redColor;
      if (this.graph.get(item).color == this.prevColor)
        this.isColorable = false;
      else this.prevColor = this.graph.get(item).color;
      this.graph.get(item).adj.forEach((adj: string) => {
        this.isVisitedNode(adj);
      });
      this.traverseNodes();
    } else return;
  }

  /* 
    Creates a graph map with nodes as keys & object with color, 
    adjacent Node List, visited flag as values 
  */
  createGraph(src: string, dest: string) {
    if (this.graph.has(src)) {
      this.graph.get(src).adj.push(dest);
    } else {
      let adjSet = [];
      adjSet.push(dest);
      this.graph.set(src, { color: null, adj: adjSet, visited: false });
    }
    if (this.graph.has(dest)) {
      this.graph.get(dest).adj.push(src);
    } else {
      let adjSet = [];
      adjSet.push(src);
      this.graph.set(dest, { color: null, adj: adjSet, visited: false });
    }
  }

  separateInnerNodes(ele: string) {
    let innerNodes = ele.split('-');
    for (let i = 0; i < innerNodes.length - 1; i++) {
      this.createGraph(innerNodes[i].trim(), innerNodes[i + 1].trim());
    }
  }
}
