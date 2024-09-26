import { useMemo } from 'react';

// Define the type for the default values. The value type must match the expected query parameter type.
type QueryParamType = StringConstructor | NumberConstructor | BooleanConstructor;

type QueryParamTypeMap = {
  [key: string]: {
    type: QueryParamType;
    default: boolean | number | string;
  };
};

const useQueryParams = <T extends QueryParamTypeMap>(typeMap: T): {
  [K in keyof T]: T[K]['type'] extends BooleanConstructor
    ? boolean
    : T[K]['type'] extends NumberConstructor
    ? number | null
    : string;
} => {
  const parseValue = (value: string | null, type: QueryParamType): boolean | number | string | null => {
    if (value === null) return ''; // In case there's no value
    switch (type) {
      case Boolean:
        return value === 'true';
      case Number:
        return !isNaN(Number(value)) ? Number(value) : null;
      case String:
      default:
        return value;
    }
  };

  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const parsedParams = {} as {
      [K in keyof T]: T[K]['type'] extends BooleanConstructor
        ? boolean
        : T[K]['type'] extends NumberConstructor
        ? number | null
        : string;
    };

    Object.keys(typeMap).forEach((key) => {
      const value = params.get(key); // Get query parameter value
      const { type, default: defaultValue } = typeMap[key];
      parsedParams[key as keyof T] = value !== null ? parseValue(value, type) : (defaultValue as any); // Use default if missing
    });

    return parsedParams;
  }, [window.location.search]);
};

export default useQueryParams;
