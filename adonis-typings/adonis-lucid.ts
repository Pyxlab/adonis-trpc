declare module '@ioc:Adonis/Lucid/Orm' {
  type InstanceTypeModel = InstanceType<LucidModel>

  type KeysOfInstanceTypeModel = keyof InstanceTypeModel
  type KeysOfInstanceTypeRelations =
    | KeysOfInstanceTypeModel
    | 'instance'
    | 'model'
    | 'client'
    | 'builder'
    | 'subQuery'
    | '__opaque_type'

  type Primitive = string | number | boolean | undefined | null | Date

  type DeepOmitHelper<T, K extends keyof T> = {
    [P in K]: T[P] extends infer O
      ? O extends Primitive
        ? O
        : O extends InstanceTypeModel[]
        ? DeepOmitArray<O, K>
        : DeepOmit<O, KeysOfInstanceTypeRelations | K>
      : never
  }

  export type DeepOmitArray<T extends InstanceTypeModel[], K = keyof any> = {
    [P in keyof T]: DeepOmit<T[P], KeysOfInstanceTypeRelations | K>
  }

  type DeepOmit<T, K = keyof any> = T extends Primitive ? T : DeepOmitHelper<T, Exclude<keyof T, K>>

  export type InferTypeModel<Model, K = keyof any> = DeepOmit<Model, KeysOfInstanceTypeModel | K>
}
