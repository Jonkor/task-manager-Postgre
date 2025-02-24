export const getUserSchema = {
    response: {
      200: {
        type: 'array',
        properties: {
          id: {type: 'integer'},
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
        id: {type: 'integer',},
        name: {type: 'string',},
        email: {type: 'string', format: 'email'},
        age: {type: 'integer'},
        createdAt: {type: 'string', format: 'date-time'},
        updatedAt: {type: 'string', format: 'date-time'}
      },
      required: ["id", "name", "email", "age"]
    }
  }

export const getTaskSchema = {
    response: {
      200: {
        type: 'array',
        properties: {
          id: {type: 'integer',},
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
        id: {type: 'integer'},
        description: {type: 'string',},
        completed: {type: 'boolean', nullable: true, default: false},
        createdAt: {type: 'string', format: 'date-time'},
        updatedAt: {type: 'string', format: 'date-time'}           
      },
      required: ["id", "description", "completed"]
    }
  }