import { nanoid } from 'nanoid'

export class Task {
  constructor(
    public id: string = nanoid(),
  ) {}
}

export class Model {
  constructor(
    public id: string = nanoid(),
  ) {}
}

export class Rag {
  constructor(
    public id: string = nanoid(),
  ) {}
}
