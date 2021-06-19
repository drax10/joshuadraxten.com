---
title: A BF Interpreter written in CSS+HTML
subtitle: a study in masochism
layout: layouts/post
tags: post
date: 2018-11-04
---

Ever since it was proven that <a href="https://jsfiddle.net/Camilo/eQyBa/">HTML and CSS are technically turing complete</a>, I've wanted to create a program with them.

So I built a project only a programmer could love: builting an interperater for [BF](https://en.wikipedia.org/wiki/Brainfuck), an esoteric programming language with only 8 commands (that I shortened down to 5).

![Demo of this turing complete css project working](https://raw.githubusercontent.com/JoshuaDraxten/bf-in-css/master/assets/screencap.gif)

## What's going on?

In a nutshell, it works by storing the state in checkboxes or radio buttons. Based on what is checked, a label element with it's `for` attribute set to the id of the next checkbox to be toggled is positioned below the mouse to queue the next action. Repeatidly clicking in the same spot where the label elements are put causes the program to compute.

## Removing 3 commands

Typically, BF is ran with 8-bit cells that can hold values up to 255, but to implement adding and subtracting on those cells would require _way more_ clicks and complexity than is unnecessary since you can [prove that 1-bit BF is still Turing complete using reduction](http://samuelhughes.com/boof/). Perhaps, I will have another masochistic streak in the future and update the project to support 8-bit cells. But for now, since the cell size is 1 bit the + and - commands do the exact same thing, so I’ve removed the `-` command.

I have not implemented the two i/o commands, because clicking a box repeatedly was already user-unfriendly. Besides, if you’re a big enough nerd to be reading this, you should be fine reading your own binary.

## Biggest challenge

**Managing Scope**

The most difficult part of this project was managing different loops. If the program encounters a `]` command it needs to go back to thes corresponding `[` command, not the first one it finds. This is very difficult to solve with only css and html.

To have a useful bracket matching system in CSS, I need to be able to change the position of a bracket element in a flat structure. Doing this with simple sibling selectors is impossible without listing out every possible combination, which in my opinion is cheating.

After a lot of time, I figured out a great hack — using [css counters](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Lists_and_Counters/Using_CSS_counters)! As you can see in [this example](https://codepen.io/JoshuaDraxten/pen/ZqYjQz/), if you use Roman numerals, you can get 4 layers of correctly indented brackets (counting the zeroth layer), which in practice is a limitation I did not run into when playing around with the BF code

**Switching tasks**

Imagine the active command to preform is the `+` command. In BF this means to increment the memory of the cell. In this 1-bit version, it just has to toggle between 1 and 0. For this command the CSS interpreter does the following:

1. See the active command is `+`
2. Position the label with it’s `for` attribute attached to the memory currently being pointed to
3. When the memory is changed go to the next command

Because the command shown is completely dependent on the state before it, if you don’t change the state, the command is never changed and the interpreter essentially halts. To get around this, I used a hack that works in every browser apart from safari — [`contenteditable` is a global attribute](https://html.spec.whatwg.org/multipage/dom.html#global-attributes) so you can make virtually any element act like a text input. If you add the `contenteditable` attribute checkbox, when you check it the cursor will go inside it and the `:focus` pseudo-selector will select it.

Using this mechanic, I was able to say if any memory value checkbox is being focused on (i.e. it has been changed just now) show the label attached to the radio box for the next command.
