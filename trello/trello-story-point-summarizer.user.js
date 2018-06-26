// ==UserScript==
// @name         Trello Agile Tools Story Point Summarizer
// @namespace    https://github.com/oohira/userjs
// @version      0.1
// @description  Summarize total story points of backlog per label.
// @author       oohira
// @match        https://trello.com/b/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const parseList = (list) => {
        const cards = Array.from(list.querySelectorAll('.list-card'))
                                          .map(card => parseCard(card))
        return {
            title: list.querySelector('.list-header-name').value,
            cards: cards,
            point: cards.map(card => card.point).reduce((acc, cur) => acc + cur, 0)
        }
    }

    const parseCard = (card) => {
        const title = card.querySelector('.list-card-title')
        const labels = Array.from(card.querySelectorAll('.card-label'))
                                          .map(label => label.innerText)
        const point = card.querySelector('.badge-icon[style*="/agiletools/"] + .badge-text')
        return {
            title: title ? title.innerText : '',
            labels: labels,
            point: point ? Number(point.innerText) : 0
        }
    }

    const summarize = (lists, filter) => {
        var points = {}
        lists.forEach(list => {
            list.cards.forEach(card => {
                card.labels.forEach(label => {
                    if (!filter || filter(label)) {
                        points[label] = (points[label] || 0) + card.point
                    }
                })
            })
        })
        return points
    }

    const main = () => {
        const lists = Array.from(document.querySelectorAll('.list')).map(list => parseList(list))
        const points = summarize(lists)
        //console.log(points)

        var div = document.getElementById('trello-point-summary')
        if (!div) {
            div = document.createElement('div')
            div.id = 'trello-point-summary'
            div.style = 'margin: 0 12px 8px'
            document.querySelector('.board-main-content')
                .insertBefore(div, document.querySelector('.board-canvas'))
        }
        div.innerHTML = Object.entries(points).sort()
            .map(([label, point]) => `<span class="card-label card-label-black mod-card-detail" style="line-height: 20px; height: 20px" title="${label}">${label}: ${point}</span>`).join('')
    }

    setInterval(main, 10 * 1000);
})();
