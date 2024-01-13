
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const filters = writable([]);
    const finalPrice= writable(0);
    const finalLength= writable(0);
    const finalBeads= writable([]);

    /* src/Filters.svelte generated by Svelte v3.46.2 */

    const { console: console_1$1 } = globals;
    const file$4 = "src/Filters.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (41:2) {:else}
    function create_else_block(ctx) {
    	let li;
    	let input;
    	let t0;
    	let label;
    	let t1_value = /*possibleFilter*/ ctx[5].name + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[3](/*possibleFilter*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", /*possibleFilter*/ ctx[5].name);
    			attr_dev(input, "class", "css-checkbox");
    			add_location(input, file$4, 42, 4, 1182);
    			attr_dev(label, "for", /*possibleFilter*/ ctx[5].name);
    			attr_dev(label, "class", "css-label");
    			add_location(label, file$4, 43, 4, 1260);
    			attr_dev(li, "class", "categories-list__item");
    			add_location(li, file$4, 41, 3, 1143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, input);
    			append_dev(li, t0);
    			append_dev(li, label);
    			append_dev(label, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(label, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(41:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:2) {#if possibleFilter.subcategories.length > 0}
    function create_if_block$1(ctx) {
    	let li;
    	let t0_value = /*possibleFilter*/ ctx[5].name + "";
    	let t0;
    	let t1;
    	let ul;
    	let t2;
    	let each_value_1 = /*possibleFilter*/ ctx[5].subcategories;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(":\n\t\t\t\t");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(ul, "class", "subcategories-list");
    			add_location(ul, file$4, 31, 4, 779);
    			attr_dev(li, "class", "categories-list__item");
    			add_location(li, file$4, 30, 3, 716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*possibleFilters, handleFilter*/ 3) {
    				each_value_1 = /*possibleFilter*/ ctx[5].subcategories;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:2) {#if possibleFilter.subcategories.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (33:5) {#each possibleFilter.subcategories as name}
    function create_each_block_1(ctx) {
    	let li;
    	let input;
    	let t0;
    	let label;
    	let t1_value = /*name*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*name*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", /*possibleFilter*/ ctx[5].name);
    			attr_dev(input, "class", "css-checkbox");
    			add_location(input, file$4, 34, 6, 910);
    			attr_dev(label, "for", /*name*/ ctx[8]);
    			attr_dev(label, "class", "css-label");
    			add_location(label, file$4, 35, 6, 990);
    			attr_dev(li, "class", "categories-list__subitem");
    			add_location(li, file$4, 33, 5, 866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, input);
    			append_dev(li, t0);
    			append_dev(li, label);
    			append_dev(label, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(label, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(33:5) {#each possibleFilter.subcategories as name}",
    		ctx
    	});

    	return block;
    }

    // (29:1) {#each possibleFilters as possibleFilter}
    function create_each_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*possibleFilter*/ ctx[5].subcategories.length > 0) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(29:1) {#each possibleFilters as possibleFilter}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let ul;
    	let each_value = /*possibleFilters*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "catgories-list");
    			add_location(ul, file$4, 27, 0, 594);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*possibleFilters, handleFilter*/ 3) {
    				each_value = /*possibleFilters*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $filters;
    	validate_store(filters, 'filters');
    	component_subscribe($$self, filters, $$value => $$invalidate(4, $filters = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Filters', slots, []);

    	var possibleFilters = [
    		{ name: 'Африка', subcategories: [] },
    		{ name: 'Готика', subcategories: [] },
    		{ name: 'Жемчуг', subcategories: [] },
    		{
    			name: 'Самые подходящие',
    			subcategories: []
    		},
    		{
    			name: 'Натуральные камни',
    			subcategories: ['Круглые', 'Овальные']
    		}
    	];

    	function handleFilter(filterName) {
    		let filterIndex = $filters.indexOf(filterName);

    		if (filterIndex >= 0) {
    			$filters.splice(filterIndex, 1);
    		} else {
    			$filters.push(filterName);
    		}

    		// for update of DOM
    		filters.set($filters);

    		console.log($filters);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	const click_handler = name => handleFilter(name);
    	const click_handler_1 = possibleFilter => handleFilter(possibleFilter.name);

    	$$self.$capture_state = () => ({
    		filters,
    		possibleFilters,
    		handleFilter,
    		$filters
    	});

    	$$self.$inject_state = $$props => {
    		if ('possibleFilters' in $$props) $$invalidate(0, possibleFilters = $$props.possibleFilters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [possibleFilters, handleFilter, click_handler, click_handler_1];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/BeadsModal.svelte generated by Svelte v3.46.2 */
    const file$3 = "src/BeadsModal.svelte";

    function create_fragment$3(ctx) {
    	let div6;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div5;
    	let div2;
    	let t4;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let div3;
    	let t6;
    	let img1;
    	let img1_src_value;
    	let t7;
    	let div4;
    	let t8;
    	let img2;
    	let img2_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "Добавить бусину";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "x";
    			t3 = space();
    			div5 = element("div");
    			div2 = element("div");
    			t4 = text("С лева ");
    			img0 = element("img");
    			t5 = space();
    			div3 = element("div");
    			t6 = text("С обеих сторон ");
    			img1 = element("img");
    			t7 = space();
    			div4 = element("div");
    			t8 = text("С права ");
    			img2 = element("img");
    			attr_dev(div0, "class", "list-item-modal__heading");
    			add_location(div0, file$3, 33, 3, 671);
    			attr_dev(div1, "class", "list-imem-modal__close");
    			add_location(div1, file$3, 34, 3, 734);
    			if (!src_url_equal(img0.src, img0_src_value = "images/left.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "‹");
    			attr_dev(img0, "class", "list-item-modal__img");
    			add_location(img0, file$3, 36, 88, 940);
    			attr_dev(div2, "class", "list-item-modal__left");
    			add_location(div2, file$3, 36, 4, 856);
    			if (!src_url_equal(img1.src, img1_src_value = "images/both.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "›");
    			attr_dev(img1, "class", "list-item-modal__img");
    			add_location(img1, file$3, 37, 96, 1107);
    			attr_dev(div3, "class", "list-item-modal__both");
    			add_location(div3, file$3, 37, 4, 1015);
    			if (!src_url_equal(img2.src, img2_src_value = "images/right.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "›");
    			attr_dev(img2, "class", "list-item-modal__img");
    			add_location(img2, file$3, 38, 91, 1270);
    			attr_dev(div4, "class", "list-item-modal__right");
    			add_location(div4, file$3, 38, 4, 1183);
    			attr_dev(div5, "class", "list-item-modal__btn-container");
    			add_location(div5, file$3, 35, 3, 807);
    			attr_dev(div6, "class", "list-item-modal");
    			add_location(div6, file$3, 32, 2, 638);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, t4);
    			append_dev(div2, img0);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, t6);
    			append_dev(div3, img1);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, t8);
    			append_dev(div4, img2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*hideAddModal*/ ctx[1], false, false, false),
    					listen_dev(div2, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(div3, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(div4, "click", /*click_handler_2*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $finalPrice;
    	let $finalLength;
    	let $finalBeads;
    	validate_store(finalPrice, 'finalPrice');
    	component_subscribe($$self, finalPrice, $$value => $$invalidate(6, $finalPrice = $$value));
    	validate_store(finalLength, 'finalLength');
    	component_subscribe($$self, finalLength, $$value => $$invalidate(7, $finalLength = $$value));
    	validate_store(finalBeads, 'finalBeads');
    	component_subscribe($$self, finalBeads, $$value => $$invalidate(8, $finalBeads = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BeadsModal', slots, []);
    	const dispatch = createEventDispatcher();
    	let { bead } = $$props;

    	function hideAddModal() {
    		dispatch('closeModal');
    	}

    	function addBead(bead, side) {
    		if (side == 'left') {
    			set_store_value(finalBeads, $finalBeads = [bead].concat($finalBeads), $finalBeads);
    		} else if (side == 'right') {
    			$finalBeads.push(bead);
    			finalBeads.set($finalBeads);
    		} else {
    			addBead(bead, 'right');
    			addBead(bead, 'left');
    		}

    		set_store_value(finalLength, $finalLength = $finalLength + bead.size, $finalLength);
    		set_store_value(finalPrice, $finalPrice = $finalPrice + bead.price, $finalPrice);
    		dispatch('closeModal');
    	}

    	const writable_props = ['bead'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BeadsModal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => addBead(bead, 'left');
    	const click_handler_1 = () => addBead(bead, 'both');
    	const click_handler_2 = () => addBead(bead, 'right');

    	$$self.$$set = $$props => {
    		if ('bead' in $$props) $$invalidate(0, bead = $$props.bead);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		finalPrice,
    		finalLength,
    		finalBeads,
    		dispatch,
    		bead,
    		hideAddModal,
    		addBead,
    		$finalPrice,
    		$finalLength,
    		$finalBeads
    	});

    	$$self.$inject_state = $$props => {
    		if ('bead' in $$props) $$invalidate(0, bead = $$props.bead);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bead, hideAddModal, addBead, click_handler, click_handler_1, click_handler_2];
    }

    class BeadsModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { bead: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BeadsModal",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*bead*/ ctx[0] === undefined && !('bead' in props)) {
    			console.warn("<BeadsModal> was created without expected prop 'bead'");
    		}
    	}

    	get bead() {
    		throw new Error("<BeadsModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bead(value) {
    		throw new Error("<BeadsModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Beads.svelte generated by Svelte v3.46.2 */

    const { console: console_1 } = globals;
    const file$2 = "src/Beads.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (42:1) {#each beads.filter(item => $filters.includes(item.theme) || $filters.length == 0) as bead}
    function create_each_block$1(ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let t1_value = /*bead*/ ctx[9].price + "";
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*bead*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = text("$");
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = "Добавить";
    			attr_dev(img, "class", "list-item__img");
    			if (!src_url_equal(img.src, img_src_value = "images/" + /*bead*/ ctx[9].img + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "bead pic");
    			add_location(img, file$2, 45, 2, 1820);
    			attr_dev(div0, "class", "list-item__price");
    			add_location(div0, file$2, 47, 3, 1934);
    			attr_dev(div1, "class", "add-btn");
    			add_location(div1, file$2, 48, 3, 1987);
    			attr_dev(div2, "class", "list-item__description");
    			add_location(div2, file$2, 46, 2, 1894);
    			attr_dev(li, "class", "list-item");
    			add_location(li, file$2, 44, 1, 1795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t0);
    			append_dev(li, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$filters*/ 4 && !src_url_equal(img.src, img_src_value = "images/" + /*bead*/ ctx[9].img + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$filters*/ 4 && t1_value !== (t1_value = /*bead*/ ctx[9].price + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(42:1) {#each beads.filter(item => $filters.includes(item.theme) || $filters.length == 0) as bead}",
    		ctx
    	});

    	return block;
    }

    // (53:1) {#if showModal}
    function create_if_block(ctx) {
    	let beadsmodal;
    	let current;

    	beadsmodal = new BeadsModal({
    			props: { bead: /*selectedBead*/ ctx[1] },
    			$$inline: true
    		});

    	beadsmodal.$on("closeModal", /*closeAddModal*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(beadsmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(beadsmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const beadsmodal_changes = {};
    			if (dirty & /*selectedBead*/ 2) beadsmodal_changes.bead = /*selectedBead*/ ctx[1];
    			beadsmodal.$set(beadsmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(beadsmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(beadsmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(beadsmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(53:1) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let ul;
    	let t;
    	let current;
    	let each_value = /*beads*/ ctx[3].filter(/*func*/ ctx[6]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*showModal*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(ul, "class", "items-list");
    			add_location(ul, file$2, 40, 0, 1625);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t);
    			if (if_block) if_block.m(ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showAddModal, beads, $filters*/ 28) {
    				each_value = /*beads*/ ctx[3].filter(/*func*/ ctx[6]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*showModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(ul, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $filters;
    	validate_store(filters, 'filters');
    	component_subscribe($$self, filters, $$value => $$invalidate(2, $filters = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Beads', slots, []);
    	let showModal = false;
    	let selectedBead = undefined;

    	let beads = [
    		{
    			id: '1',
    			price: 23,
    			size: 2,
    			img: '1',
    			shape: 'oval',
    			theme: 'Африка'
    		},
    		{
    			id: '2',
    			price: 19,
    			size: 2,
    			img: '2',
    			shape: 'oval',
    			theme: 'Африка'
    		},
    		{
    			id: '3',
    			price: 21,
    			size: 2,
    			img: '3',
    			shape: 'oval',
    			theme: 'Готика'
    		},
    		{
    			id: '4',
    			price: 23,
    			size: 2,
    			img: '4',
    			shape: 'oval',
    			theme: 'Готика'
    		},
    		{
    			id: '5',
    			price: 21,
    			size: 2,
    			img: '5',
    			shape: 'oval',
    			theme: 'Готика'
    		},
    		{
    			id: '6',
    			price: 25,
    			size: 2,
    			img: '6',
    			shape: 'oval',
    			theme: 'Готика'
    		},
    		{
    			id: '7',
    			price: 20,
    			size: 1,
    			img: '7',
    			shape: 'round',
    			theme: 'Готика'
    		},
    		{
    			id: '8',
    			price: 25,
    			size: 1,
    			img: '8',
    			shape: 'round',
    			theme: 'Готика'
    		},
    		{
    			id: '9',
    			price: 24,
    			size: 1,
    			img: '9',
    			shape: 'round',
    			theme: 'Готика'
    		},
    		{
    			id: '10',
    			price: 17,
    			size: 1,
    			img: '10',
    			shape: 'round',
    			theme: 'Готика'
    		},
    		{
    			id: '11',
    			price: 15,
    			size: 1,
    			img: '11',
    			shape: 'round',
    			theme: 'Готика'
    		},
    		{
    			id: '15',
    			price: 16,
    			size: 1,
    			img: '11',
    			shape: 'round',
    			theme: 'Готика'
    		},
    		{
    			id: '13',
    			price: 25,
    			size: 2,
    			img: '13',
    			shape: 'oval',
    			theme: 'Африка'
    		},
    		{
    			id: '14',
    			price: 19,
    			size: 2,
    			img: '14',
    			shape: 'oval',
    			theme: 'Африка'
    		},
    		{
    			id: '12',
    			price: 20,
    			size: 2,
    			img: '12',
    			shape: 'oval',
    			theme: 'Готика'
    		}
    	];

    	function filterBead(bead) {
    		console.log(bead);
    		if ($filters.includes(bead.theme) || $filters.length == 0) return true; else return false;
    	}

    	function showAddModal(bead) {
    		$$invalidate(0, showModal = true);
    		$$invalidate(1, selectedBead = bead);
    	}

    	function closeAddModal() {
    		$$invalidate(0, showModal = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Beads> was created with unknown prop '${key}'`);
    	});

    	const func = item => $filters.includes(item.theme) || $filters.length == 0;
    	const click_handler = bead => showAddModal(bead);

    	$$self.$capture_state = () => ({
    		filters,
    		finalPrice,
    		finalLength,
    		finalBeads,
    		BeadsModal,
    		showModal,
    		selectedBead,
    		beads,
    		filterBead,
    		showAddModal,
    		closeAddModal,
    		$filters
    	});

    	$$self.$inject_state = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('selectedBead' in $$props) $$invalidate(1, selectedBead = $$props.selectedBead);
    		if ('beads' in $$props) $$invalidate(3, beads = $$props.beads);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showModal,
    		selectedBead,
    		$filters,
    		beads,
    		showAddModal,
    		closeAddModal,
    		func,
    		click_handler
    	];
    }

    class Beads extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Beads",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Result.svelte generated by Svelte v3.46.2 */
    const file$1 = "src/Result.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (8:0) {#each $finalBeads as bead, i}
    function create_each_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = "images/" + /*bead*/ ctx[1].img + ".png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "transform", "rotate(" + /*i*/ ctx[3] * (360 / /*$finalBeads*/ ctx[0].length) + "deg)");
    			attr_dev(img, "alt", "bead");
    			add_location(img, file$1, 10, 2, 318);
    			attr_dev(div, "class", "result_bead");
    			set_style(div, "transform", "rotate(" + -/*i*/ ctx[3] * (360 / /*$finalBeads*/ ctx[0].length) + "deg)");
    			add_location(div, file$1, 9, 1, 224);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$finalBeads*/ 1 && !src_url_equal(img.src, img_src_value = "images/" + /*bead*/ ctx[1].img + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$finalBeads*/ 1) {
    				set_style(img, "transform", "rotate(" + /*i*/ ctx[3] * (360 / /*$finalBeads*/ ctx[0].length) + "deg)");
    			}

    			if (dirty & /*$finalBeads*/ 1) {
    				set_style(div, "transform", "rotate(" + -/*i*/ ctx[3] * (360 / /*$finalBeads*/ ctx[0].length) + "deg)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:0) {#each $finalBeads as bead, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*$finalBeads*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$finalBeads*/ 1) {
    				each_value = /*$finalBeads*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $finalBeads;
    	validate_store(finalBeads, 'finalBeads');
    	component_subscribe($$self, finalBeads, $$value => $$invalidate(0, $finalBeads = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Result', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Result> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ finalBeads, $finalBeads });
    	return [$finalBeads];
    }

    class Result extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Result",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let aside;
    	let div2;
    	let div1;
    	let t0;
    	let div0;
    	let t2;
    	let filters_1;
    	let t3;
    	let beads;
    	let t4;
    	let div7;
    	let div3;
    	let t5;
    	let span;
    	let t6;
    	let t7;
    	let t8;
    	let div4;
    	let result;
    	let t9;
    	let div5;
    	let t10;
    	let t11;
    	let t12;
    	let div6;
    	let current;
    	filters_1 = new Filters({ $$inline: true });
    	beads = new Beads({ $$inline: true });
    	result = new Result({ $$inline: true });

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			div2 = element("div");
    			div1 = element("div");
    			t0 = text("Показывать категории: ");
    			div0 = element("div");
    			div0.textContent = "‹";
    			t2 = space();
    			create_component(filters_1.$$.fragment);
    			t3 = space();
    			create_component(beads.$$.fragment);
    			t4 = space();
    			div7 = element("div");
    			div3 = element("div");
    			t5 = text("Итого: ");
    			span = element("span");
    			t6 = text(/*$finalPrice*/ ctx[0]);
    			t7 = text("$");
    			t8 = space();
    			div4 = element("div");
    			create_component(result.$$.fragment);
    			t9 = space();
    			div5 = element("div");
    			t10 = text("Длинна в см: ");
    			t11 = text(/*$finalLength*/ ctx[1]);
    			t12 = space();
    			div6 = element("div");
    			div6.textContent = "Заказать »";
    			attr_dev(div0, "class", "categries__toggle");
    			add_location(div0, file, 11, 57, 305);
    			attr_dev(div1, "class", "categories__heading");
    			add_location(div1, file, 11, 2, 250);
    			attr_dev(div2, "class", "categories");
    			add_location(div2, file, 10, 1, 223);
    			attr_dev(aside, "class", "left");
    			add_location(aside, file, 9, 0, 201);
    			add_location(span, file, 20, 9, 469);
    			attr_dev(div3, "class", "result-wrapper__price");
    			add_location(div3, file, 19, 1, 424);
    			attr_dev(div4, "class", "result");
    			add_location(div4, file, 22, 1, 508);
    			attr_dev(div5, "class", "result-wrapper__length");
    			add_location(div5, file, 25, 1, 551);
    			attr_dev(div6, "class", "result-wrapper__order");
    			add_location(div6, file, 26, 1, 624);
    			attr_dev(div7, "class", "result-wrapper");
    			add_location(div7, file, 18, 0, 394);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div2, t2);
    			mount_component(filters_1, div2, null);
    			append_dev(aside, t3);
    			mount_component(beads, aside, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div3);
    			append_dev(div3, t5);
    			append_dev(div3, span);
    			append_dev(span, t6);
    			append_dev(span, t7);
    			append_dev(div7, t8);
    			append_dev(div7, div4);
    			mount_component(result, div4, null);
    			append_dev(div7, t9);
    			append_dev(div7, div5);
    			append_dev(div5, t10);
    			append_dev(div5, t11);
    			append_dev(div7, t12);
    			append_dev(div7, div6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$finalPrice*/ 1) set_data_dev(t6, /*$finalPrice*/ ctx[0]);
    			if (!current || dirty & /*$finalLength*/ 2) set_data_dev(t11, /*$finalLength*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filters_1.$$.fragment, local);
    			transition_in(beads.$$.fragment, local);
    			transition_in(result.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filters_1.$$.fragment, local);
    			transition_out(beads.$$.fragment, local);
    			transition_out(result.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			destroy_component(filters_1);
    			destroy_component(beads);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div7);
    			destroy_component(result);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $finalPrice;
    	let $finalLength;
    	validate_store(finalPrice, 'finalPrice');
    	component_subscribe($$self, finalPrice, $$value => $$invalidate(0, $finalPrice = $$value));
    	validate_store(finalLength, 'finalLength');
    	component_subscribe($$self, finalLength, $$value => $$invalidate(1, $finalLength = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Filters,
    		Beads,
    		Result,
    		filters,
    		finalPrice,
    		finalLength,
    		$finalPrice,
    		$finalLength
    	});

    	return [$finalPrice, $finalLength];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.querySelector('.content-wrapper')
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
