<template>
    <div class="accordion-item">
        <div class='noselect' id='title-box' v-on:click="select">
            <b>{{this.title}}</b>
            <b class='noselect' id='min-button'>
                <i class="fa fa-minus" v-if=is_open></i>
                <i class="fa fa-plus" v-else></i>
            </b>
        </div>
        <div id="content" v-show="is_open">
            <slot></slot>
        </div>
    </div>
</template>

<script>

export default {
    name: 'AccordionItem',
    data() {
        return {
            is_open: this.start_open,
        }
    },
    props: {
        title: String,
        start_open: Boolean,
    },
    methods: {
        select() {
            this.is_open = !this.is_open;
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.accordion-item {
    /* border: 1px solid var(--panel-border-blur, rgba(80, 80, 80, 0.4)); */ /* Removed default border, rely on title-box */
    margin: 8px 0; /* Vertical margin for separation */
    position: relative;
    background-color: var(--accordion-item-bg, rgba(60, 60, 60, 0.5)); /* Slightly different from panel for visual hierarchy */
    border-radius: 8px; /* Rounded corners for the item */
    overflow: hidden; /* Ensure content clips to border-radius */
}

#min-button {
    float: right;
    padding-right: 5px; /* Ensure icon isn't flush with edge */
    color: var(--text-color-secondary, #B0B0B0);
}

#title-box {
    /* background-color: var(--btn-bg); */ /* Removed, using new style below */
    background-color: var(--accordion-title-bg, transparent); /* Transparent to show item bg, or a very subtle distinct color */
    color: var(--text-color-primary, #E0E0E0);
    text-align: left;
    padding: 12px 15px; /* Increased padding */
    margin: 0px;
    font-weight: 500; /* Medium weight for title */
    border-bottom: 1px solid var(--accordion-border, rgba(80, 80, 80, 0.3)); /* Subtle separator if content shown */
    transition: background-color 0.2s ease;
}

.accordion-item:last-child #title-box {
    border-bottom: none; /* No border for the last item if it's closed */
}

.accordion-item #title-box:hover {
    cursor: pointer;
    background-color: var(--accordion-title-hover, rgba(255, 255, 255, 0.05)); /* Subtle hover */
}

/* #title-box:active { */ /* Active state might be too much, hover is enough */
    /* background-color: var(--btn-active); */
/* } */

#content {
    /* border-top: 1px solid rgb(126, 126, 126); */ /* Handled by title-box border if needed */
    padding: 15px; /* Padding for the content area */
    background-color: var(--accordion-content-bg, rgba(30,30,30,0.3)); /* Slightly darker/more transparent for content */
}

.accordion-item[open] #title-box {
    /* Style for title when open, if needed */
}

.accordion-item:not(:last-child) {
    margin-bottom: 10px; /* Add more space between accordion items */
}

</style>