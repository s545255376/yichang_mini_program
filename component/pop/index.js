// component/pop/index.js
Component({
    externalClasses: ['customclass'],
    properties: {
        popname: String,
        hidecloseicon: {
            type: Boolean,
            value: false
        }
    },
    data: {},
    methods: {
        close: function () {
            const {
                popname
            } = this.data;
            this.triggerEvent('eventclose', popname);
        }
    }
})