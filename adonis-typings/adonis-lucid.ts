declare module '@ioc:Adonis/Lucid/Orm' {
  /**
   * The `InstanceTypeModel` type is a helper type that is used to infer the instance type of a `LucidModel`
   */
  type InstanceTypeModel = InstanceType<LucidModel>

  /**
   * The `KeysOfInstanceTypeModel` type is a helper type that is used to extract the keys of the `InstanceTypeModel`
   */
  type KeysOfInstanceTypeModel = keyof InstanceTypeModel

  /**
   * The `KeysOfInstanceTypeRelations` type is a helper type that extends `KeysOfInstanceTypeModel`
   * and includes additional keys used in the ORM relationships such as 'instance', 'model',
   * 'client', 'builder', 'subQuery', and '__opaque_type'.
   */
  type KeysOfInstanceTypeRelations =
    | KeysOfInstanceTypeModel
    | 'instance'
    | 'model'
    | 'client'
    | 'builder'
    | 'subQuery'
    | '__opaque_type'

  /**
   * The `Primitive` type is a helper type that defines the basic types that can be inferred
   */
  type Primitive = string | number | boolean | undefined | null | Date

  /**
   * The `DeepInferTypeModelHelper` is a recursive type that infers the type of the properties within a model.
   * It uses the `KeysOfInstanceTypeModel` and `Primitive` helper types to infer the type of properties.
   * `T` is the type of the model, `K` is the keys that are excluded from the inference.
   */
  type DeepInferTypeModelHelper<T, K extends keyof T> = {
    [P in K]: T[P] extends infer O
      ? O extends Primitive
        ? O
        : O extends InstanceTypeModel[]
        ? DeepInferTypeModelArray<Omit<O, KeysOfInstanceTypeRelations>, K>
        : DeepInferTypeModel<O, K | KeysOfInstanceTypeRelations>
      : never
  }

  /**
   * The `DeepInferTypeModelArray` type is a helper type that infers the type of array properties within a model.
   * `T` is the type of the model, `K` is the keys that are excluded from the inference.
   */
  export type DeepInferTypeModelArray<T, K> = {
    [P in keyof T]: DeepInferTypeModel<T[P], KeysOfInstanceTypeRelations | K>
  }

  /**
   * The `DeepInferTypeModel` type is a recursive type that infers the type of the properties within a model.
   * It uses the `KeysOfInstanceTypeModel` and `Primitive` helper types to infer the type of properties.
   * `T` is the type of the model, `K` is the keys that are excluded from the inference.
   */
  type DeepInferTypeModel<T, K> = T extends Primitive
    ? T
    : DeepInferTypeModelHelper<T, Exclude<keyof T, K>>

  /**
   * The `InferTypeModel` type is the final exported type that can be used to infer the types of properties
   * within a Lucid ORM model. It uses the `DeepInferTypeModel` and `KeysOfInstanceTypeModel` helper types
   * to infer the types of properties within the model.
   * `Model` is the type of the model you want to infer the properties from, `K` is the keys that are excluded from the inference.
   */
  export type InferTypeModel<Model, K extends keyof Model = never> = DeepInferTypeModel<
    Model,
    K | KeysOfInstanceTypeModel
  >
}
