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
    margin: 10px 0;
    background-color: var(--accordion-item-bg-blur-dark, rgba(45, 45, 45, 0.65)); /* Darker semi-transparent */
    border: 1px solid var(--accordion-border-blur-dark, rgba(255, 255, 255, 0.1)); /* Subtle light border */
    border-radius: 8px;
    overflow: hidden;
    backdrop-filter: blur(8px) saturate(160%); /* Adjusted blur for accordion */
    -webkit-backdrop-filter: blur(8px) saturate(160%);
}

#title-box {
    background-color: var(--accordion-title-bg-blur-dark, rgba(55, 55, 55, 0.7)); /* Darker title background */
    color: var(--accordion-title-text-dark, #f0f0f0); /* Light title text */
    text-align: left;
    padding: 10px 15px;
    margin: 0px;
    font-weight: 500;
    border-bottom: 1px solid var(--accordion-border-blur-dark, rgba(255, 255, 255, 0.1));
    transition: background-color 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.accordion-item.is_open #title-box {
    border-bottom: 1px solid var(--accordion-border-blur-dark, rgba(255, 255, 255, 0.1));
}

.accordion-item:not(.is_open) #title-box {
    border-bottom: none;
}

#title-box:hover {
    cursor: pointer;
    background-color: var(--accordion-title-hover-blur-dark, rgba(70, 70, 70, 0.75));
}

#min-button {
    color: var(--accordion-icon-color-dark, #d0d0d0); /* Light icon color */
    font-size: 0.9rem;
}

#content {
    padding: 15px 18px;
    background-color: transparent; /* Content shows accordion-item background */
    /* Text color within slot content should be light or set by child components */
}

/* Optional: if you want to ensure the last item doesn't have a double border with the panel footer */
.accordion-item:last-child {
    /* margin-bottom: 0; */ /* If needed */
}

</style>