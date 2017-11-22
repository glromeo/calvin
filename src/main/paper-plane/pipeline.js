class Task {

}

class Queue {

    constructor() {
        this.pendingTasks = 0;
        this.nextTask = null;
    }

    get done() {
        return this.pendingTasks === 0;
    }

    next() {
        return this;
    }
}

