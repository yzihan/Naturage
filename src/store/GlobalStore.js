const initialGlobalSate = {
    images: [
        {
            name: 'Bark-01',
            imageURL: 'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/image/tree-01.png',
        },
        {
            name: 'Flower-01',
            imageURL: 'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/image/flower-01.png',
        },
        {
            name: 'Leaf-01',
            imageURL: 'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/image/leaf-01.png',
        },
        {
            name: 'Flower-02',
            imageURL: 'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/image/flower-02.jpg',
        },
    ],
    currentTexture: {
        type: -1,
        name: '',
        url: '',
    }
}

export const selectCurrentTexture = (data) => ({
    type: 'SELECT_CURRENT_TEXTURE',
    payload: data    
})

const globalReducer = (state = initialGlobalSate, action) => {
    switch(action.type) {
        case 'SELECT_CURRENT_TEXTURE':
            return {
                ...state,
                currentTexture: action.payload
            }
        default:
            return state;
    }
}

export default globalReducer;
