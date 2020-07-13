import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { find, get } from 'lodash';

import Option from 'app/components/option/Option';
import omgcp_chevron from 'app/images/omgcp_chevron.svg';

import * as styles from './Select.module.scss';

interface IOption {
  value: string,
  image?: string,
  title: string,
  detail: string
}

interface SelectProps {
  placeholder: string,
  value: string,
  onSelect: (value: string) => void,
  options: IOption[],
  className?: string
}

function Select ({
  placeholder,
  value,
  onSelect,
  options = [],
  className
}: SelectProps): JSX.Element {
  const selectNode = useRef(null);

  const [ isOpen, setIsOpen ]: [ boolean, any ] = useState(false);
  const [ inputValue, setInputValue ]: [ string, any ] = useState('');
  const [ filteredOptions, setFilteredOptions ]: [ IOption[], any ] = useState([]);

  useEffect(() => {
    if (options.length && !inputValue) {
      setFilteredOptions(options);
    }
  }, [options]);

  useEffect(() => {
    function handleClick (e) {
      if (selectNode.current && !selectNode.current.contains(e.target)) {
        setInputValue('');
        setFilteredOptions(options);
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleFieldClick (): void {
    setIsOpen(true);
  }

  function handleInputChange (value: string): void {
    onSelect(null);
    setInputValue(value);
    const filtered = options.filter(i => {
      return i.title.toLowerCase().includes(value.toLowerCase());
    });
    setFilteredOptions(filtered);
  }

  function handleOptionClick (option: IOption): void {
    onSelect(option.value);
    setInputValue('');
    setIsOpen(false);
  }

  const selected: IOption = find(options, i => i.value === value);

  return (
    <div
      ref={selectNode}
      className={[
        styles.Select,
        className
      ].join(' ')}
    >
      <div className={styles.field}>
        {isOpen && (
          <>
            <input
              placeholder='Search by Reddit username'
              type='text'
              value={inputValue}
              spellCheck={false}
              onChange={e => handleInputChange(e.target.value)}
            />
            <img className={styles.chevron} src={omgcp_chevron} alt='chevron' />
          </>
        )}

        {!isOpen && selected && (
          <Option
            onClick={handleFieldClick}
            title={selected.title}
            detail={selected.detail}
            image={selected.image}
          />
        )}

        {!isOpen && !selected && (
          <div
            onClick={handleFieldClick}
            className={styles.placeholder}
          >
            {placeholder}
          </div>
        )}

        {isOpen && (
          <div className={styles.dropdown}>
            {filteredOptions && filteredOptions.map((option: IOption, index: number) => {
              return (
                <Option
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  title={option.title}
                  detail={option.detail}
                  image={option.image}
                  selected={option.value === get(selected, 'value')}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Select);
