<template>
<div class="autocomplete">
    <input :id="id" class="autocomplete-input form-control" :placeholder="placeholder" @focusout="focusout" @focus="focus" @keydown.13="chooseItem" @keydown.tab="chooseItem" @keydown.40="moveDown" @keydown.38="moveUp" v-model="inputValue" type="text">
    <div v-if="showForm===true">
      <ul :class="{
        'autocomplete-list': true,
        [id+'-list']: true
      }" v-if="searchMatch.length > 0">
          <li :class="{active: selectedIndex === index}" v-for="(result, index) in searchMatch" @click="selectItem(index), chooseItem()" v-html="highlightWord(result)">

          </li>
      </ul>
      <ul :class="{
        'autocomplete-list': true,
        [id+'-list']: true
      }" v-else>
          <li :class="{active: selectedIndex === index}" v-for="(result, index) in frequentEncounters" @click="selectItem(index), chooseItem()" v-html="highlightWord(result)">

          </li>
      </ul>
    </div>

</div>
</template>

<script>
const standardItems = [];
export default {
    name: 'utilAutocomplete',
    props: ["items", "split", "placeholder", "label", "textarea", "rows", "cols", "frequentEncounters"],
    data() {
        return {
            id: 'input-' + parseInt(Math.random() * 1000),
            inputValue: "",
            searchMatch: [],
            selectedIndex: 0,
            clickedChooseItem: false,
            wordIndex: 0,
            showForm:false
        };
    },
    mounted() {
        const _self = this;
        // console.log("this id", this.id);
        document.querySelector('#' + this.id)
            .addEventListener('input', function () {
                const caret = getCaretCoordinates(this, this.selectionEnd);

                if (_self.searchMatch.length > 0) {
                    const element = document.querySelectorAll('.' + _self.id + '-list');

                    if (element[0]) {
                        element[0].style.top = caret.top + 40 + 'px';
                        element[0].style.left = caret.left + 'px';
                    }
                }
            });
    },
    computed: {
        listToSearch() {
            if (typeof this.items !== "undefined" && this.items.length > 0) {
                return this.items;
            } else {
                return standardItems;
            }
        },
        currentWord() {
            var inputVal = this.inputValue.indexOf(this.split);
            if (inputVal < 0) {
                return this.inputValue.replace(/(\r\n|\n|\r)/gm, ' ').split(' ')[this.wordIndex];
            } else {
                return this.inputValue;
            }

            // return this.inputValue;
        },
        inputSplitted() {
            return this.inputValue.replace(/(\r\n|\n|\r)/gm, ' ').split(" ");
            // return this.inputValue;
        }
    },
    watch: {
        inputValue() {
          if (this.inputValue!="")this.focus();
            // console.log("this.inputSplitted",this.inputSplitted);
            this.selectedIndex = 0;
            this.wordIndex = this.inputSplitted.length - 1;
        }
    },
    methods: {
        highlightWord(word) {
            // const regex = new RegExp("(" + this.currentWord + ")", "g");
            // const regex = new RegExp("this.currentWord", "g");
            // return word.replace(regex, '<mark>$1</mark>');
            // return word.replace(this.currentWord, '<mark>' + this.currentWord+ '</mark>');
            return word.split('_')[0];
        },
        setWord(word) {
            // let currentWords = this.inputValue.replace(/(\r\n|\n|\r)/gm, '__br__ ').split(' ');
            // currentWords[this.wordIndex] = currentWords[this.wordIndex].replace(this.currentWord, word + ' ');
            //
            // this.wordIndex += 1;
            // this.inputValue = currentWords.join(' ').replace(/__br__\s/g, '\n');
            this.inputValue = word;
        },
        moveDown() {
            if (this.selectedIndex < this.searchMatch.length - 1) {
                this.selectedIndex++;
            }
        },
        moveUp() {
            if (this.selectedIndex !== -1) {
                this.selectedIndex--;
            }
        },
        selectItem(index) {
            this.selectedIndex = index;
            this.chooseItem();
        },
        chooseItem(e) {
            this.clickedChooseItem = true;

            if (this.selectedIndex !== -1 && this.searchMatch.length > 0) {
                if (e) {
                    e.preventDefault();
                }
                this.setWord(this.searchMatch[this.selectedIndex]);
                this.selectedIndex = -1;
            }
        },
        focusout(e) {
            setTimeout(() => {
                if (!this.clickedChooseItem) {
                    this.searchMatch = [];
                    this.selectedIndex = -1;
                    this.showForm = false;
                }
                this.searchMatch = [];
            }, 200);
        },
        focus() {
          this.showForm = true;
            this.searchMatch = [];
            if (this.currentWord && this.currentWord !== "") {
                this.searchMatch = this.listToSearch.filter(
                    el => el.toLowerCase().indexOf(this.currentWord.toLowerCase()) > -1
                );
            }
            else{
              this.searchMatch = this.frequentEncounters;//bringing in frequent encounters for user to select
            }

            if (
                this.searchMatch.length === 1 &&
                this.searchMatch[0].toLowerCase().indexOf(this.currentWord.toLowerCase()) == 0
            ) {
                // console.log("in autocomplete, index? ", this.items.indexOf(this.currentWord));
                this.$emit('sendBack', {
                    match: this.currentWord,
                    index: this.items.indexOf(this.currentWord)
                });
                if (this.searchMatch[0].toLowerCase() == this.currentWord.toLowerCase()) {
                    this.showForm = false; //hideform
                    this.searchMatch = [];//this triggers watch and downstream
                    this.setWord("");//clearing input form after user choose
                } //hide autofill suggestion when a project has been selected.
                //this.searchMatch = [];

            }
        }
    }
};

(function () {
    function e(b, e, f) {
        if (!h) throw Error("textarea-caret-position#getCaretCoordinates should only be called in a browser");
        if (f = f && f.debug || !1) {
            var a = document.querySelector("#input-textarea-caret-position-mirror-div");
            a && a.parentNode.removeChild(a)
        }
        a = document.createElement("div");
        a.id = "input-textarea-caret-position-mirror-div";
        document.body.appendChild(a);
        var c = a.style,
            d = window.getComputedStyle ? window.getComputedStyle(b) : b.currentStyle,
            k = "INPUT" === b.nodeName;
        c.whiteSpace = "pre-wrap";
        k || (c.wordWrap = "break-word");
        c.position = "absolute";
        f || (c.visibility = "hidden");
        l.forEach(function (a) {
            k && "lineHeight" === a ? c.lineHeight = d.height : c[a] = d[a]
        });
        m ? b.scrollHeight > parseInt(d.height) && (c.overflowY = "scroll") : c.overflow = "hidden";
        a.textContent = b.value.substring(0, e);
        k && (a.textContent = a.textContent.replace(/\s/g, "\u00a0"));
        var g = document.createElement("span");
        g.textContent = b.value.substring(e) || ".";
        a.appendChild(g);
        b = {
            top: g.offsetTop + parseInt(d.borderTopWidth),
            left: g.offsetLeft + parseInt(d.borderLeftWidth),
            height: parseInt(d.lineHeight)
        };
        f ? g.style.backgroundColor = "#aaa" : document.body.removeChild(a);
        return b
    }
    var l =
        "direction boxSizing width height overflowX overflowY borderTopWidth borderRightWidth borderBottomWidth borderLeftWidth borderStyle paddingTop paddingRight paddingBottom paddingLeft fontStyle fontVariant fontWeight fontStretch fontSize fontSizeAdjust lineHeight fontFamily textAlign textTransform textIndent textDecoration letterSpacing wordSpacing tabSize MozTabSize"
        .split(" "),
        h = "undefined" !== typeof window,
        m = h && null != window.mozInnerScreenX;
    "undefined" != typeof module && "undefined" != typeof module.exports ? module.exports = e : h && (window.getCaretCoordinates = e)
})
();
</script>
