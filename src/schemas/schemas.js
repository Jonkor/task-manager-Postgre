export const getUserSchema = {
  response: {
    200: {
      type: 'array',
      properties: {
        id: {type: 'string', format: 'uuid'},
        // id: {type: 'integer'},
        name: {type: 'string',},
        email: {type: 'string', format: 'email'},
        age: {type: 'integer'},
        createdAt: {type: 'string', format: 'date-time'},
        updatedAt: {type: 'string', format: 'date-time'}            
      }
    }
  }
}

export const postUserSchema = {
  body: {
    type: 'object',
    properties: {
      id: {type: 'string', format: 'uuid'},
      // id: {type: 'integer',},
      name: {type: 'string',},
      email: {type: 'string', format: 'email'},
      age: {type: 'integer'},
      createdAt: {type: 'string', format: 'date-time'},
      updatedAt: {type: 'string', format: 'date-time'}
    },
    required: ["name", "email", "age"]
  }
}

export const loginUserSchema = {
    body: {
        type: 'object',
        properties: {
            email: {type: 'string', format: 'email'},
            password: {type: 'string'} 
        },
        required: ["email", "password"]
    }
}

export const getTaskSchema = {
  response: {
    200: {
      type: 'array',
      properties: {
        id: {type: 'string', format: 'uuid'},
        // id: {type: 'integer',},
        description: {type: 'string',},
        completed: {type: 'boolean',},
        createdAt: {type: 'string', format: 'date-time'},
        updatedAt: {type: 'string', format: 'date-time'}            
      }
    }
  }
}

export const postTaskSchema = {
  body: {
    type: 'object',
    properties: {
      id: {type: 'string', format: 'uuid'},
      // id: {type: 'integer'},        
      description: {type: 'string',},
      completed: {type: 'boolean', nullable: true, default: false},
      createdAt: {type: 'string', format: 'date-time'},
      updatedAt: {type: 'string', format: 'date-time'}           
    },
    required: ["description", "completed"]
  }
}

export const patchTaskSchema = {
  body: {
    type: 'object',
    properties: {
      id: {type: 'string', format: 'uuid'},
      // id: {type: 'integer'},        
      description: {type: 'string',},
      completed: {type: 'boolean', nullable: true, default: false},
      createdAt: {type: 'string', format: 'date-time'},
      updatedAt: {type: 'string', format: 'date-time'}           
    },
  },
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }  
}

export const deleteTaskSchema = {
  params: {
    type: 'object',
    properties: {
        id: {type: 'string', format: 'uuid'}
    }
  }  
}