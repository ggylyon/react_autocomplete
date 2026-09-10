import React, { useCallback, useMemo, useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import classNames from 'classnames';

type Person = {
  name: string;
  sex: string;
  born: number;
  died: number;
  fatherName: string | null;
  motherName: string | null;
  slug: string;
};

function debounce(
  callback: React.Dispatch<React.SetStateAction<string>>,
  delay: number,
) {
  let timer = 0;

  return (input: string) => {
    window.clearInterval(timer);

    timer = window.setTimeout(() => {
      callback(input);
    }, delay);
  };
}

export const App: React.FC = () => {
  const [suggestion, setSuggestion] = useState('');
  const [appliedSuggestion, setAppliedSuggestion] = useState('');

  const [isFocused, setIsFocused] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const applySuggestion = useCallback(debounce(setAppliedSuggestion, 300), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSuggestion(event.target.value);
    applySuggestion(event.target.value);

    setSelectedPerson(null);
  };

  const filteredSuggestions = useMemo(() => {
    return peopleFromServer.filter(person => {
      return person.name
        .toLowerCase()
        .includes(appliedSuggestion.trim().toLowerCase());
    });
  }, [appliedSuggestion]);

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div className="dropdown is-active">
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={suggestion}
              onChange={event => handleChange(event)}
              onFocus={() => setIsFocused(true)}
            />
          </div>

          {isFocused && filteredSuggestions.length > 0 && (
            <div
              className="dropdown-menu"
              role="menu"
              data-cy="suggestions-list"
            >
              <div className="dropdown-content">
                {filteredSuggestions.map(person => {
                  return (
                    <div
                      className="dropdown-item"
                      data-cy="suggestion-item"
                      key={person.slug}
                      onClick={() => {
                        setSelectedPerson(person);
                        setIsFocused(false);
                      }}
                    >
                      <p
                        className={classNames(
                          person.sex === 'm'
                            ? 'has-text-link'
                            : 'has-text-danger',
                        )}
                      >
                        {person.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isFocused && filteredSuggestions.length <= 0 && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
