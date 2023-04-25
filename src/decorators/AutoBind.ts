const AutoBind = (_: any, __: string, propDescriptor: PropertyDescriptor) => {
  const originalMethod = propDescriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    // is like having a value property with extra loginc that runs before the value is returned
    get() {
      // this will refer to whatever is responsible for triggering the getter method
      const boundFuntion = originalMethod.bind(this);
      return boundFuntion;
    }
  };

  return newDescriptor;
}

export default AutoBind;
