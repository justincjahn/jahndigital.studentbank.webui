/**
 * GraphQL instance object.
 */
type Instance = {
  // The unique ID of the instance.
  id: number;

  // A descriptive name for the instance.
  description: string;

  // If the instance is active
  isActive: boolean;
}

export default Instance;
