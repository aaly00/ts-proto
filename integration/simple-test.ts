import { Reader } from 'protobufjs';
import {
  Nested,
  Nested_InnerEnum,
  Nested_InnerMessage,
  OneOfMessage,
  Simple,
  StateEnum
} from '../build/simple';
import { simple as pbjs } from '../build/pbjs';
import ISimple = pbjs.ISimple;
import PbChild = pbjs.Child;
import PbSimple = pbjs.Simple;
import PbOneOfMessage = pbjs.OneOfMessage;
import PbState = pbjs.StateEnum;
import PbNested = pbjs.Nested;
import PbNested_InnerMessage = pbjs.Nested.InnerMessage;
import PbNested_DeepMessage = pbjs.Nested.InnerMessage.DeepMessage;
import PbNested_InnerEnum = pbjs.Nested.InnerEnum;
import INested = pbjs.INested;

describe('simple', () => {
  it('generates types correctly', () => {
    const simple: Simple = {
      name: 'asdf',
      age: 1,
      child: { name: 'child' },
      state: StateEnum.ON,
      grandchildren: [{ name: 'grand1' }, { name: 'grand2' }],
      coins: [2, 4, 6],
      snacks: ['a', 'b'],
      oldStates: [StateEnum.ON, StateEnum.OFF]
    };
    expect(simple.name).toEqual('asdf');
  });

  it('can decode', () => {
    const s1: ISimple = {
      name: 'asdf',
      age: 1,
      child: PbChild.fromObject({ name: 'foo' }),
      state: PbState.ON,
      grandchildren: [PbChild.fromObject({ name: 'grand1' }), PbChild.fromObject({ name: 'grand2' })],
      coins: [2, 4, 6],
      snacks: ['a', 'b'],
      oldStates: [PbState.ON, PbState.OFF]
    };
    const s2 = Simple.decode(Reader.create(PbSimple.encode(PbSimple.fromObject(s1)).finish()));
    expect(s2).toEqual(s1);
  });

  it('can encode', () => {
    const s1: Simple = {
      name: 'asdf',
      age: 1,
      child: { name: 'foo' },
      state: StateEnum.ON,
      grandchildren: [{ name: 'grand1' }, { name: 'grand2' }],
      coins: [2, 4, 6],
      snacks: ['a', 'b'],
      oldStates: [StateEnum.ON, StateEnum.OFF]
    };
    const s2 = PbSimple.toObject(PbSimple.decode(Simple.encode(s1).finish()));
    expect(s2).toEqual(s1);
  });

  it('can decode and fallback to default values', () => {
    const s1: ISimple = {};
    const s2 = Simple.decode(Reader.create(PbSimple.encode(PbSimple.fromObject(s1)).finish()));
    expect(s2.name).toEqual('');
    expect(s2.age).toEqual(0);
    expect(s2.state).toEqual(StateEnum.UNKNOWN);
    expect(s2.grandchildren).toEqual([]);
    expect(s2.coins).toEqual([]);
    expect(s2.snacks).toEqual([]);
    expect(s2.oldStates).toEqual([]);
  });

  it('can encode inner types', () => {
    const s1: Nested = {
      name: 'asdf',
      message: {
        name: 'asdf',
        deep: { name: 'asdf' }
      } as Nested_InnerMessage,
      state: Nested_InnerEnum.GOOD
    };
    const s2 = PbNested.toObject(PbNested.decode(Nested.encode(s1).finish()));
    expect(s2).toEqual(s1);
  });

  it('can decode inner types', () => {
    const s1: INested = {
      name: 'asdf',
      message: PbNested_InnerMessage.fromObject({
        name: 'asdf',
        deep: PbNested_DeepMessage.fromObject({ name: 'asdf' })
      }),
      state: PbNested_InnerEnum.GOOD
    };
    const s2 = Nested.decode(Reader.create(PbNested.encode(PbNested.fromObject(s1)).finish()));
    expect(s2).toEqual(s1);
  });

  it('observes how pbjs handles null', () => {
    // the ISimple types are in theory only useful for construction
    const s1 = PbSimple.fromObject({ name: null, age: 1 });
    // as after construction, they return the empty string
    expect(s1.name).toEqual('');
    const s2 = PbSimple.decode(PbSimple.encode(s1).finish());
    expect(s2.name).toEqual('');
  });

  it('observes how pbjs handles undefined', () => {
    const s1 = PbSimple.fromObject({});
    expect(s1.name).toEqual('');
    expect(s1.age).toEqual(0);
    const s2 = PbSimple.decode(PbSimple.encode(s1).finish());
    expect(s2.name).toEqual('');
    expect(s2.age).toEqual(0);
  });

  it('can encode oneofs', () => {
    const s1: OneOfMessage = {
      first: 'bob',
      last: undefined
    };
    const s2 = PbOneOfMessage.toObject(PbOneOfMessage.decode(OneOfMessage.encode(s1).finish()));
    expect(s2).toMatchInlineSnapshot(`
Object {
  "first": "bob",
}
`);
  });

  it('can decode oneofs', () => {
    const s1 = PbOneOfMessage.fromObject({
      last: 'smith'
    });
    const s2 = OneOfMessage.decode(Reader.create(PbOneOfMessage.encode(s1).finish()));
    expect(s2).toMatchInlineSnapshot(`
Object {
  "last": "smith",
}
`);
  });

  it('can encode oneofs to json', () => {
    const s1: OneOfMessage = {
      first: 'bob',
      last: undefined
    };
    const ourJson = s1;
    const pbJson = PbOneOfMessage.decode(OneOfMessage.encode(s1).finish()).toJSON();
    expect(ourJson).toEqual(pbJson);
  });

  it('can decode oneofs from json', () => {
    const s1 = PbOneOfMessage.fromObject({
      last: 'smith'
    });
    const fromJson = s1.toJSON() as OneOfMessage;
    const fromPb = OneOfMessage.decode(Reader.create(PbOneOfMessage.encode(s1).finish()));
    expect(fromJson).toEqual(fromPb);
  });
});
