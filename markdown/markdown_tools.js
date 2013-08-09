/**
 * Removes all 'script' tags
 */
function removeAllScripts() {
  var i, scripts = document.querySelectorAll('script');
  for (i = 0; i < scripts.length; i += 1) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }
}

/**
 * Replaces all 'div class="script"' into 'script' tag
 */
function replaceDivscriptToScript() {
  var i, script, divscript = document.querySelectorAll('.script');
  for (i = 0; i < divscript.length; i += 1) {
    divscript[i].insertAdjacentHTML(
      'afterend',
      '<' + 'script' + '>' + divscript[i].textContent + '<' + '/script' + '>'
    );
    divscript[i].parentNode.removeChild(divscript[i]);
  }
}

/**
 * Wraps the html output into an element
 */
function wrapAllIn(element) {
  var i, children = Array.prototype.slice.call(document.body.children);
  for (i = 0; i < children.length; i += 1) {
    element.appendChild(children[i]);
  }
  document.body.appendChild(element);
  return element;
}

/**
 * Creates an index and table from a 'div class="index-and-table" [from="2"]'.
 *
 * Headers will be anchored if not already anchored
 */
function indexAndTable() {
  var from, sib, s, header, level, summaries, tmp, tmp2;
  summaries = Array.prototype.slice.
    call(document.querySelectorAll('.index-and-table'));
  for (s = 0; s < summaries.length; s += 1) {
    from = parseInt(summaries[s].getAttribute('from') || '1');
    level = from;
    sib = summaries[s].nextSibling;
    while (sib) {
      if (/^H[0-9]+$/.test(sib.tagName)) {
        header = parseInt(/[0-9]+/.exec(sib.tagName)[0]);
        if (header < from) {
          break;
        }
        while (level < header) {
          tmp = document.createElement('ul');
          summaries[s].appendChild(tmp);
          summaries[s] = tmp;
          level += 1;
        }
        while (level > header) {
          summaries[s] = summaries[s].parentNode;
          level -= 1;
        }
        tmp = document.createElement('a');
        tmp.setAttribute('href', '#' + sib.textContent);
        tmp.textContent = sib.textContent;

        tmp2 = document.createElement('li');
        tmp2.appendChild(tmp);

        if (sib.innerHTML.indexOf('<a name') === -1) {
          tmp = document.createElement('a');
          tmp.setAttribute('name', sib.textContent);

          sib.insertBefore(tmp, sib.firstChild);
        }

        summaries[s].appendChild(tmp2);
      }
      sib = sib.nextSibling;
    }
  }
}
