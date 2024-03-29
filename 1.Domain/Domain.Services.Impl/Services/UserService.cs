﻿using AutoMapper;
using Core;
using Core.Persistance;
using Domain.Model;
using Domain.Services.Contracts.User;
using Domain.Services.Impl.Validators;
using Domain.Services.Interfaces.Services;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Domain.Services.Impl.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly IRepository<User> _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILog<UserService> _log;

        public UserService(IMapper mapper, IRepository<User> userRepository,
                           IUnitOfWork unitOfWork, ILog<UserService> log)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _userRepository = userRepository;
            _log = log;
        }

        public ReadedUserContract Authenticate(string username, string password)
        {
            #region V1
            var user = this._userRepository
                                .Query()
                                .Where(u => string.Equals(u.Username, username, StringComparison.InvariantCultureIgnoreCase) && string.Equals(u.Password, Core.HashUtility.GetStringSha256Hash(password), StringComparison.InvariantCultureIgnoreCase))
                                .FirstOrDefault();

            if (user != null)
            {
                return _mapper.Map<ReadedUserContract>(user);
            }
            else
            {
                return null;
            }
            #endregion

            #region V2
            #endregion
        }

        public ReadedUserContract Authenticate(string username)
        {            
            var user = this._userRepository
                                .Query()
                                .Where(u => string.Equals(u.Username, username, StringComparison.InvariantCultureIgnoreCase))
                                .FirstOrDefault();

            if (user != null)
            {
                return _mapper.Map<ReadedUserContract>(user);
            }
            else
            {
                return null;
            }
        }

        public IEnumerable<ReadedUserContract> GetAll()
        {
            var userQuery = _userRepository.QueryEager();

            var users = userQuery.ToList();

            return _mapper.Map<List<ReadedUserContract>>(users);
        }

        public ReadedUserContract GetById(int id)
        {
            var user = _userRepository.Query().FirstOrDefault(x => x.Id == id);

            return _mapper.Map<ReadedUserContract>(user);
        }

        public ReadedUserRoleContract GetUserRole(string username)
        {
            var user = _userRepository.Query().FirstOrDefault(x => x.Username.ToUpper() == username.ToUpper());
            return _mapper.Map<ReadedUserRoleContract>(user);
        }
    }
}
